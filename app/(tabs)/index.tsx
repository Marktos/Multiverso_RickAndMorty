import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { OfflineBanner } from '../../components/BannerSinConexion';
import { useFavorites } from '../../context/FavoritesContext';
import { colors, useTheme } from '../../context/ThemeContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import api from '../../services/api';
import telemetry from '../../services/telemetry';
import storage from '../../utils/storage';

export default function HomeScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { favorites } = useFavorites();
  const { isConnected } = useNetworkStatus();
  const router = useRouter();
  
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aliveCount, setAliveCount] = useState(0);
  const [deadCount, setDeadCount] = useState(0);

  useEffect(() => {
    telemetry.logScreenView('Home');
    loadStats();
  }, [isConnected]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      if (isConnected) {
        const response = await api.getCharacters(1);
        setTotalCharacters(response.info.count);
        
        // Obtener estadísticas de vivos y muertos
        const aliveResponse = await api.getCharacters(1, { status: 'alive' });
        setAliveCount(aliveResponse.info.count);
        
        const deadResponse = await api.getCharacters(1, { status: 'dead' });
        setDeadCount(deadResponse.info.count);
      } else {
        // Modo offline - usar datos en caché
        const cached = await storage.getCachedCharacters();
        setTotalCharacters(cached.length);
        setAliveCount(cached.filter((c: any) => c.status === 'Alive').length);
        setDeadCount(cached.filter((c: any) => c.status === 'Dead').length);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPress = (status: string) => {
    telemetry.logFilterApplied('status', status);
    router.push({
      pathname: '/characters',
      params: { filter: status }
    });
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View 
      className="flex-1 rounded-2xl p-4 mx-1 items-center"
      style={{ backgroundColor: themeColors.card }}
    >
      <MaterialIcons name={icon} size={32} color={color} />
      <Text 
        className="text-3xl font-bold mt-2"
        style={{ color: themeColors.text }}
      >
        {value}
      </Text>
      <Text 
        className="text-sm mt-1"
        style={{ color: themeColors.textSecondary }}
      >
        {title}
      </Text>
    </View>
  );

  const FilterButton = ({ title, status, icon, color }: any) => (
    <TouchableOpacity
      onPress={() => handleFilterPress(status)}
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: themeColors.card }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: color + '20' }}
          >
            <MaterialIcons name={icon} size={24} color={color} />
          </View>
          <Text 
            className="text-lg font-semibold"
            style={{ color: themeColors.text }}
          >
            {title}
          </Text>
        </View>
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={themeColors.textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
      {!isConnected && <OfflineBanner />}
      
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text 
            className="text-3xl font-bold mb-2"
            style={{ color: themeColors.text }}
          >
            MultiversoHub
          </Text>
          <Text 
            className="text-base"
            style={{ color: themeColors.textSecondary }}
          >
            Explora el universo de Rick & Morty
          </Text>
        </View>

        {/* Stats Cards */}
        {loading ? (
          <ActivityIndicator size="large" color={themeColors.primary} className="my-8" />
        ) : (
          <>
            <View className="flex-row mb-6">
              <StatCard
                title="Personajes"
                value={totalCharacters}
                icon="people"
                color={themeColors.primary}
              />
              <StatCard
                title="Favoritos"
                value={favorites.length}
                icon="favorite"
                color={themeColors.danger}
              />
            </View>

            {/* Quick Filters */}
            <Text 
              className="text-xl font-bold mb-4"
              style={{ color: themeColors.text }}
            >
              Filtros Rápidos
            </Text>

            <FilterButton
              title={`Vivos (${aliveCount})`}
              status="alive"
              icon="favorite"
              color={themeColors.success}
            />

            <FilterButton
              title={`Muertos (${deadCount})`}
              status="dead"
              icon="close"
              color={themeColors.danger}
            />

            <FilterButton
              title="Estado Desconocido"
              status="unknown"
              icon="help"
              color={themeColors.warning}
            />

            <TouchableOpacity
              onPress={() => router.push('/characters')}
              className="rounded-xl p-4 mb-3"
              style={{ backgroundColor: themeColors.primary }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-center">
                <MaterialIcons name="search" size={24} color="#FFFFFF" />
                <Text className="text-lg font-semibold text-white ml-2">
                  Ver Todos los Personajes
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}