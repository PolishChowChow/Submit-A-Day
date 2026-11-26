import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Spinner } from 'tamagui';

import { Screen } from '@/components/ui';

// Web: GitHub redirects the sign-in popup to this page. This hands the URL (with the code) back
// to the window that opened the popup and closes it. A no-op on iOS/Android and outside a popup.
WebBrowser.maybeCompleteAuthSession();

/**
 * /oauth/github: GitHub's redirect target (see GITHUB_REDIRECT_PATH). The sign-in itself is
 * finished by the screen that started it (expo-auth-session receives the URL), so this screen
 * only gets out of the way: on Android the deep link also navigates here.
 */
export default function GitHubRedirectRoute() {
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  return (
    <Screen centered>
      <Spinner />
    </Screen>
  );
}
