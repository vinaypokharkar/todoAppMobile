import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import RootNavigator from '../navigation/RootNavigator';
import { useAuthListener } from '../features/auth/useAuthListener';
import { configureGoogleSignIn } from '../features/auth/googleSignIn';

function Root() {
  const { theme } = useTheme();
  useAuthListener();

  useEffect(() => { configureGoogleSignIn(); }, []);

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
        <Provider store={store}>
          <ThemeProvider>
            <Root />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
