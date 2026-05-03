/**
 * Registers the Sentry Expo plugin only when org + project are set (e.g. EAS env or .env).
 * Avoids "[@sentry/react-native/expo] Missing config..." on every `expo start`.
 *
 * Local dev: omit SENTRY_ORG / SENTRY_PROJECT — @sentry/react-native stays in package.json for Sentry.init() later.
 * Production: set SENTRY_ORG and SENTRY_PROJECT (see https://docs.sentry.io/platforms/react-native/manual-setup/expo/)
 */
module.exports = ({ config }) => {
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  const basePlugins = [...(config.plugins ?? [])];

  const plugins = basePlugins.filter((p) => {
    if (p === '@sentry/react-native') return false;
    if (Array.isArray(p) && p[0] === '@sentry/react-native') return false;
    return true;
  });

  if (org && project) {
    plugins.push([
      '@sentry/react-native',
      { organization: org, project },
    ]);
  }

  return {
    ...config,
    plugins,
  };
};
