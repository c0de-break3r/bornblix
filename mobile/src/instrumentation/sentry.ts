import * as Sentry from '@sentry/react-native';
import type { ComponentType } from 'react';

let initialized = false;

/** Call once at app entry (before rendering). Uses `EXPO_PUBLIC_SENTRY_DSN` when set. */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || initialized) return;
  initialized = true;

  Sentry.init({
    dsn,
    sendDefaultPii: true,
    tracesSampleRate: __DEV__ ? 1.0 : 0.15,
    debug: __DEV__,
  });
}

export function isSentryEnabled(): boolean {
  return initialized;
}

/** Error boundary + native crash reporting when Sentry is initialized. */
export function wrapRootComponent<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  if (!initialized) return Component;
  return Sentry.wrap(Component as ComponentType<Record<string, unknown>>) as ComponentType<P>;
}
