import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { ClerkProvider } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import { store } from './store';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import RootNavigator from '../navigation/RootNavigator';
import { useAuthListener } from '../features/auth/useAuthListener';
import { tokenCache } from '../features/auth/tokenCache';
import { CLERK_PUBLISHABLE_KEY } from '../config/env';

// Required once at startup so an in-progress OAuth browser session (Google)
// resolves back into the app instead of leaving a dangling browser tab.
WebBrowser.maybeCompleteAuthSession();

function Root() {
  const { theme } = useTheme();
  useAuthListener();

  return (
    <>
      <StatusBar
        barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.bg}
      />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    // GestureHandlerRootView must wrap everything, or Swipeable silently
    // does nothing on Android.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
          <Provider store={store}>
            <ThemeProvider>
              <Root />
            </ThemeProvider>
          </Provider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
