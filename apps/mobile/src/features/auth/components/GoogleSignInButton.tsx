import React, { useCallback } from 'react';
import { GoogleIcon } from '@/components/icons/BrandIcons';
import { SocialButton } from './SocialButton';
import { DEMO_GOOGLE_PROFILE, GoogleProfile, isGoogleConfigured, useGoogleSignIn } from '../googleAuth';

interface GoogleSignInButtonProps {
  /** Shown on the button when a real Google account is wired up. */
  label: string;
  onSuccess: (profile: GoogleProfile) => void;
  /** Called with an error the screen should show under the form. */
  onNotice: (message: string) => void;
}

/**
 * "Continue with Google".
 *
 * Split into two components on purpose: `useGoogleSignIn` throws without an
 * OAuth client ID, so the live variant must not be mounted until one exists.
 * Until then the button runs a clearly-labelled demo sign-in, so the flow can
 * still be demonstrated.
 */
export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  return isGoogleConfigured() ? <LiveGoogleButton {...props} /> : <DemoGoogleButton {...props} />;
}

function LiveGoogleButton({ label, onSuccess, onNotice }: GoogleSignInButtonProps) {
  const { signIn, isReady, status, error } = useGoogleSignIn(onSuccess);

  React.useEffect(() => {
    if (error) onNotice(error);
  }, [error, onNotice]);

  return (
    <SocialButton label={label} icon={<GoogleIcon size={19} />} onPress={signIn} busy={status === 'pending'} disabled={!isReady} />
  );
}

function DemoGoogleButton({ onSuccess }: GoogleSignInButtonProps) {
  // The profile carries `isDemo`, so the screen writes the "this is a demo"
  // note itself — writing it here would be overwritten by the screen's own.
  const signInAsDemo = useCallback(() => onSuccess(DEMO_GOOGLE_PROFILE), [onSuccess]);

  return <SocialButton label="Continue with Google (demo)" icon={<GoogleIcon size={19} />} onPress={signInAsDemo} />;
}
