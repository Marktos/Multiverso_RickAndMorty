import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors, useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Personajes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}