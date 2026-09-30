// Client-picked booking id: photos upload under it before the row exists, and a
// retried submit reuses it instead of creating a second booking.
// ponytail: Math.random v4, not crypto. Ids are not secrets (RLS guards every
// read); switch to expo-crypto's randomUUID if that ever changes.
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
