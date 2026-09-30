// RLS regression check for migration 0023 (/enhance B02). Not wired into npm:
// it needs PGlite, which is not a project dependency. Run it from any folder:
//   npm i @electric-sql/pglite@0.3 && node rls-check.mjs <repo-root> [upTo]
// Pass upTo=0022 to see the checks fail on the old schema.
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = process.argv[2];
const upTo = process.argv[3] ?? '9999';
const dir = join(repo, 'supabase', 'migrations');
const db = new PGlite();

await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, is_anonymous boolean default false);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.role() returns text language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.role', true), '') $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as
  $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
create schema cron;
create function cron.schedule(a text, b text, c text) returns bigint language sql as $$ select 1::bigint $$;
create publication supabase_realtime;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`);

for (const f of readdirSync(dir).filter((n) => n.endsWith('.sql')).sort()) {
  if (f.slice(0, 4) > upTo) break;
  const sql = readFileSync(join(dir, f), 'utf8').replace(/create extension if not exists pg_cron[^;]*;/gi, '');
  try {
    await db.exec(sql);
    console.log('applied', f);
  } catch (e) {
    console.log('FAILED', f, e.message);
    process.exit(1);
  }
}

const C = '00000000-0000-0000-0000-00000000000c';
const P = '00000000-0000-0000-0000-00000000000a';
const Q = '00000000-0000-0000-0000-00000000000b';
await db.exec(`
insert into auth.users (id) values ('${C}'), ('${P}'), ('${Q}');
insert into public.profiles (id, phone) values ('${C}', '+910000000000'), ('${P}', null), ('${Q}', null)
  on conflict (id) do update set phone = excluded.phone;
`);

const as = async (uid, sql) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid}', false);
    select set_config('request.jwt.claims', '{"sub":"${uid}","is_anonymous":false}', false);
    set role authenticated;`);
  try { return await db.query(sql); } finally { await db.exec('reset role;'); }
};
let fails = 0;
const check = (name, ok) => { console.log(ok ? 'PASS' : 'FAIL', name); if (!ok) fails++; };
const throws = async (fn) => { try { await fn(); return false; } catch (e) { if (process.env.DEBUG) console.log('  err:', e.message); return true; } };
const errOf = async (fn) => { try { await fn(); return ''; } catch (e) { return e.message; } };

// SEC-1
check('customer can insert a plain requested booking', !(await throws(() =>
  as(C, `insert into public.bookings (customer_id, category_slug) values ('${C}', 'ac')`))));
check('customer cannot insert a done booking', await throws(() =>
  as(C, `insert into public.bookings (customer_id, category_slug, status) values ('${C}', 'ac', 'done')`)));
check('customer cannot insert a pre-paid booking', await throws(() =>
  as(C, `insert into public.bookings (customer_id, category_slug, paid_at) values ('${C}', 'ac', now())`)));

// SEC-2 + SEC-12
await as(P, `insert into public.provider_profiles (user_id, services, verify_tier) values ('${P}', '{ac}', 'verified')`);
let r = await db.query(`select verify_tier from public.provider_profiles where user_id = '${P}'`);
check('provider insert cannot self-verify', r.rows[0].verify_tier === 'basic');
await as(P, `update public.provider_profiles set verify_tier = 'verified', bio = 'x' where user_id = '${P}'`);
r = await db.query(`select verify_tier, bio from public.provider_profiles where user_id = '${P}'`);
check('provider update cannot self-verify', r.rows[0].verify_tier === 'basic');
check('provider update of other columns still works', r.rows[0].bio === 'x');
await db.exec(`set role service_role; update public.provider_profiles set verify_tier = 'verified' where user_id = '${P}'; reset role;`);
r = await db.query(`select verify_tier from public.provider_profiles where user_id = '${P}'`);
check('service role can set verify_tier', r.rows[0].verify_tier === 'verified');
r = await db.query(`select count(*)::int n from public.provider_stats where provider_id = '${P}'`);
check('provider_stats row created on signup', r.rows[0].n === 1);

// RULE-8
await as(Q, `insert into public.provider_profiles (user_id, services) values ('${Q}', '{ac}')`);
const b = (await db.query(`select id from public.bookings limit 1`)).rows[0].id;
await db.exec(`insert into public.dispatch_offers (booking_id, provider_id, wave, window_sec, response)
  values ('${b}', '${Q}', 1, 60, 'pending')`);
r = await as(Q, `select id from public.bookings where id = '${b}'`);
check('pending offer can read booking', r.rows.length === 1);
await db.exec(`update public.dispatch_offers set response = 'declined' where provider_id = '${Q}'`);
r = await as(Q, `select id from public.bookings where id = '${b}'`);
check('declined offer cannot read booking', r.rows.length === 0);
await db.exec(`update public.bookings set assigned_provider_id = '${Q}', status = 'assigned' where id = '${b}'`);
r = await as(Q, `select id from public.bookings where id = '${b}'`);
check('assigned pro can read booking', r.rows.length === 1);

// SEC-11
r = await as(Q, `select phone from public.profiles where id = '${C}'`);
check('assigned pro sees customer phone on a live job', r.rows.length === 1);
await db.exec(`alter table public.bookings disable trigger bookings_touch;
  update public.bookings set status = 'done', updated_at = now() - interval '2 days' where id = '${b}';`);
r = await as(Q, `select phone from public.profiles where id = '${C}'`);
check('phone hidden 2 days after done', r.rows.length === 0);
await db.exec(`update public.bookings set updated_at = now() - interval '2 hours' where id = '${b}';`);
r = await as(Q, `select phone from public.profiles where id = '${C}'`);
check('phone visible 2 hours after done', r.rows.length === 1);

// SEC-9 (0024)
check('bad UPI id rejected', (await errOf(() =>
  as(P, `update public.provider_profiles set upi_id = 'x@' where user_id = '${P}'`))).includes('invalid upi_id'));
check('good UPI id accepted', !(await throws(() =>
  as(P, `update public.provider_profiles set upi_id = 'ravi.k@okaxis' where user_id = '${P}'`))));
await db.exec(`set session_replication_role = replica;
  update public.provider_profiles set upi_id = 'legacy@' where user_id = '${Q}';
  set session_replication_role = origin;`);
check('pro with a legacy bad UPI can still change availability', !(await throws(() =>
  as(Q, `update public.provider_profiles set availability_status = 'busy' where user_id = '${Q}'`))));
check('oversize booking description rejected', await throws(() =>
  as(C, `insert into public.bookings (customer_id, category_slug, description) values ('${C}', 'ac', repeat('x', 1001))`)));

// COR-4 (0025): assigned pro reads the job photos; others do not.
await db.exec(`grant usage on schema storage to authenticated; grant select, insert on storage.objects to authenticated;
  insert into storage.objects (bucket_id, name) values
    ('job-photos', '${C}/${b}/1.jpg'), ('job-photos', '${C}/not-a-uuid/2.jpg'), ('job-photos', '${P}/${b}/3.jpg');`);
r = await as(Q, `select name from storage.objects where bucket_id = 'job-photos'`);
check('assigned pro reads the booking photo', r.rows.some((x) => x.name === `${C}/${b}/1.jpg`));
check('pro cannot read a photo under another user folder', !r.rows.some((x) => x.name === `${P}/${b}/3.jpg`));
r = await as(P, `select name from storage.objects where name = '${C}/${b}/1.jpg'`);
check('unrelated pro cannot read the booking photo', r.rows.length === 0);
r = await as(C, `select name from storage.objects where bucket_id = 'job-photos'`);
check('customer still reads own photos, bad path does not error', r.rows.length === 2);

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exit(fails ? 1 : 0);
