import { useSignIn } from '@clerk/clerk-expo';
import { type Href, Link, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  const finalizeAndGoHome = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }
        const url = decorateUrl('/');
        router.replace(url as Href);
      },
    });
  };

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === 'complete') {
      await finalizeAndGoHome();
    } else if (signIn.status === 'needs_second_factor') {
      // MFA — extend per https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code',
      );
      if (emailCodeFactor) {
        await signIn.mfa?.sendEmailCode?.();
      }
    } else {
      console.error('Sign-in attempt not complete:', signIn.status);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa?.verifyEmailCode?.({ code });

    if (signIn.status === 'complete') {
      await finalizeAndGoHome();
    } else {
      console.error('Sign-in attempt not complete after MFA:', signIn.status);
    }
  };

  if (signIn.status === 'needs_client_trust') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your account</Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666666"
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        {errors?.fields?.code != null && (
          <Text style={styles.error}>{String((errors.fields as { code?: { message?: string } }).code?.message)}</Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === 'fetching' && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === 'fetching'}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={() => signIn.mfa?.sendEmailCode?.()}>
          <Text style={styles.secondaryButtonText}>I need a new code</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={() => signIn.reset?.()}>
          <Text style={styles.secondaryButtonText}>Start over</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#666666"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
      />
      {errors?.fields?.emailAddress != null && (
        <Text style={styles.error}>
          {String((errors.fields as { emailAddress?: { message?: string } }).emailAddress?.message)}
        </Text>
      )}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry
        onChangeText={setPassword}
      />
      {errors?.fields?.password != null && (
        <Text style={styles.error}>
          {String((errors.fields as { password?: { message?: string } }).password?.message)}
        </Text>
      )}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || fetchStatus === 'fetching') && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === 'fetching'}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      {errors != null && (
        <Text style={styles.debug}>{JSON.stringify(errors, null, 2)}</Text>
      )}

      <View style={styles.linkContainer}>
        <Text style={styles.muted}>Don&apos;t have an account? </Text>
        <Link href="/sign-up" asChild>
          <Pressable>
            <Text style={styles.link}>Sign up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFDF5',
    paddingTop: 56,
  },
  title: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#0D0D14',
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#2C2520',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: { color: '#0a7ea4', fontWeight: '600' },
  linkContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, alignItems: 'center', gap: 4 },
  muted: { color: '#5c5c5c' },
  link: { color: '#0a7ea4', fontWeight: '600' },
  error: { color: '#d32f2f', fontSize: 12, marginTop: -8 },
  debug: { fontSize: 10, opacity: 0.5, marginTop: 8 },
});
