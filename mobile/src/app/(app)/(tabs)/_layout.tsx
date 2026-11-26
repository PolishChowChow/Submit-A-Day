import { Tabs } from 'expo-router';
import { History, ListChecks, Settings } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="days"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
