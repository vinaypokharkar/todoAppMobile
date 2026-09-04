import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeProvider';
import TaskListScreen from '../features/tasks/screens/TaskListScreen';
import CalendarScreen from '../features/tasks/screens/CalendarScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, string> = {
  Tasks: 'format-list-checks',
  Calendar: 'calendar-month-outline',
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
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
