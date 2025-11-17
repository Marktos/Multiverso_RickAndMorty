import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { colors, useTheme } from '../context/ThemeContext';

export const OfflineBanner: React.FC = () => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View 
      className="py-2 px-4 flex-row items-center justify-center"
      style={{ backgroundColor: themeColors.warning }}
    >
      <MaterialIcons name="wifi-off" size={20} color="#FFFFFF" />
      <Text className="ml-2 text-white font-semibold">
        Sin conexión - Mostrando datos guardados
      </Text>
    </View>
  );
};