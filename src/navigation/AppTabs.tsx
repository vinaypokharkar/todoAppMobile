import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeProvider';
import TaskListScreen from '../features/tasks/screens/TaskListScreen';
import UpcomingScreen from '../features/tasks/screens/UpcomingScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, string> = {
  Tasks: 'format-list-checks',
  Upcoming: 'calendar-clock-outline',
  Profile: 'account-circle-outline',
};

export default function AppTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.borderSoft,
        },
        tabBarIcon: ({ color, size }) => (
          <Icon name={ICONS[route.name as keyof TabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Tasks" component={TaskListScreen} />
      <Tab.Screen name="Upcoming" component={UpcomingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
