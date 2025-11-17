// app/(tabs)/profile.tsx
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { OfflineBanner } from '../../components/BannerSinConexion';
import { useFavorites } from '../../context/FavoritesContext';
import { colors, useTheme } from '../../context/ThemeContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import telemetry from '../../services/telemetry';
import storage from '../../utils/storage';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const themeColors = colors[theme];
  const { favorites, clearFavorites } = useFavorites();
  const { isConnected } = useNetworkStatus();
  const [isClearing, setIsClearing] = useState(false);

  React.useEffect(() => {
    telemetry.logScreenView('Profile');
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleClearData = () => {
    Alert.alert(
      'Borrar Datos',
      '¿Estás seguro de que quieres eliminar todos los datos guardados? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await storage.clearAll();
              clearFavorites();
              telemetry.logDataCleared();
              
              Alert.alert(
                'Datos Eliminados',
                'Todos los datos han sido eliminados correctamente.'
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudieron eliminar los datos. Intenta nuevamente.'
              );
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    rightElement, 
    onPress 
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: themeColors.card }}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="flex-row items-center">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: themeColors.primary + '20' }}
        >
          <MaterialIcons name={icon} size={24} color={themeColors.primary} />
        </View>
        
        <View className="flex-1">
          <Text 
            className="text-base font-semibold"
            style={{ color: themeColors.text }}
          >
            {title}
          </Text>
          {description && (
            <Text 
              className="text-sm mt-1"
              style={{ color: themeColors.textSecondary }}
            >
              {description}
            </Text>
          )}
        </View>

        {rightElement}
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, label, value, color }: any) => (
    <View 
      className="flex-1 rounded-xl p-4 mx-1 items-center"
      style={{ backgroundColor: themeColors.card }}
    >
      <MaterialIcons name={icon} size={32} color={color} />
      <Text 
        className="text-2xl font-bold mt-2"
        style={{ color: themeColors.text }}
      >
        {value}
      </Text>
      <Text 
        className="text-xs mt-1 text-center"
        style={{ color: themeColors.textSecondary }}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
      {!isConnected && <OfflineBanner />}
      
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="items-center mb-6">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: themeColors.primary + '20' }}
          >
            <MaterialIcons 
              name="person" 
              size={48} 
              color={themeColors.primary} 
            />
          </View>
          
          <Text 
            className="text-2xl font-bold"
            style={{ color: themeColors.text }}
          >
            MultiversoHub
          </Text>
          <Text 
            className="text-sm mt-1"
            style={{ color: themeColors.textSecondary }}
          >
            Rick & Morty Explorer
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row mb-6">
          <StatCard
            icon="favorite"
            label="Favoritos"
            value={favorites.length}
            color={themeColors.danger}
          />
          <StatCard
            icon={isConnected ? "wifi" : "wifi-off"}
            label="Estado"
            value={isConnected ? "Online" : "Offline"}
            color={isConnected ? themeColors.success : themeColors.warning}
          />
        </View>

        {/* Settings Section */}
        <Text 
          className="text-xl font-bold mb-4"
          style={{ color: themeColors.text }}
        >
          Configuración
        </Text>

        <SettingItem
          icon="palette"
          title="Tema"
          description={`Tema ${theme === 'dark' ? 'oscuro' : 'claro'} activado`}
          rightElement={
            <Switch
              value={theme === 'dark'}
              onValueChange={handleToggleTheme}
              trackColor={{ 
                false: themeColors.border, 
                true: themeColors.primary + '80' 
              }}
              thumbColor={theme === 'dark' ? themeColors.primary : '#f4f3f4'}
            />
          }
        />

        <SettingItem
          icon="delete-outline"
          title="Borrar Datos"
          description="Elimina todos los datos guardados localmente"
          rightElement={
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={themeColors.textSecondary} 
            />
          }
          onPress={handleClearData}
        />

        {/* App Info Section */}
        <Text 
          className="text-xl font-bold mt-6 mb-4"
          style={{ color: themeColors.text }}
        >
          Información de la App
        </Text>

        <SettingItem
          icon="info-outline"
          title="Versión"
          description={Constants.expoConfig?.version || '1.0.0'}
        />

        <SettingItem
          icon="code"
          title="Plataforma"
          description={Constants.platform?.ios ? 'iOS' : 'Android'}
        />

        <SettingItem
          icon="school"
          title="Proyecto"
          description="Trabajo Práctico - Desarrollo Móvil"
        />

        {/* Footer */}
        <View className="items-center py-8">
          <Text 
            className="text-sm"
            style={{ color: themeColors.textSecondary }}
          >
            Marcos Neculman
          </Text>
          <Text 
            className="text-xs mt-2"
            style={{ color: themeColors.textSecondary }}
          >
            Datos de rickandmortyapi.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}