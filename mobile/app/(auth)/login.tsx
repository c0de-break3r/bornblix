import { Redirect } from 'expo-router';

/** Legacy route — use `/sign-in` with Clerk custom password flow. */
export default function LoginRedirect() {
  return <Redirect href="/sign-in" />;
}
