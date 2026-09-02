import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../app/hooks';
import { AuthStackParamList, AppStackParamList } from './types';
import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import TaskFormScreen from '../features/tasks/screens/TaskFormScreen';
import TaskDetailScreen from '../features/tasks/screens/TaskDetailScreen';
import AppTabs from './AppTabs';
import SplashScreen from '../components/SplashScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

export default function RootNavigator() {
  const { user, initialising } = useAppSelector(s => s.auth);

  // Hold on the splash until Firebase reports the persisted session.
  // Without this the app flashes Login for a frame on every warm start.
  if (initialising) return <SplashScreen />;

  return (
    <NavigationContainer>
      {user ? (
        // Conditional rendering of whole navigators — NOT navigate() calls.
        // Signing out unmounts the app stack entirely, so there is no back
        // route into authenticated screens.
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="Tabs" component={AppTabs} />
          <AppStack.Screen
            name="TaskForm"
            component={TaskFormScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <AppStack.Screen name="TaskDetail" component={TaskDetailScreen} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
