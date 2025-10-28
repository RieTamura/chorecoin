import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'ご褒美',
          tabBarIcon: ({ color }) => <TabBarIcon name="gift" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: '管理',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Simple icon component (replace with actual icon library like @expo/vector-icons)
function TabBarIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    gift: '🎁',
    calendar: '📅',
    settings: '⚙️',
  };
  return <Text style={{ fontSize: 24, color }}>{icons[name] || '❓'}</Text>;
}
