import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { FavoritesProvider } from '../context/FavoritesContext';
import { ThemeProvider } from '../context/ThemeContext';
import telemetry from '../services/telemetry';

export default function RootLayout() {
  useEffect(() => {
    telemetry.logAppStart();
  }, []);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="character/[id]" />
        </Stack>
      </FavoritesProvider>
    </ThemeProvider>
  );
}