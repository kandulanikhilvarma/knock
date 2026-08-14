import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

// No DSN (a fresh clone, or a build that deliberately opts out) → no-op, not a
// crash. Errors still surface in the console.
export function initSentry() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    // The app handles phone numbers and addresses; never let the SDK attach
    // them on its own. Breadcrumbs and stack traces only.
    sendDefaultPii: false,
    tracesSampleRate: 0,
    enableAutoSessionTracking: true,
  });
}

export { Sentry };
