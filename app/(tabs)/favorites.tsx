import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { OfflineBanner } from '../../components/BannerSinConexion';
import { CharacterCard } from '../../components/CardPesonajes';
import { useFavorites } from '../../context/FavoritesContext';
import { colors, useTheme } from '../../context/ThemeContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import api from '../../services/api';
import telemetry from '../../services/telemetry';
import { Character } from '../../types';
import storage from '../../utils/storage';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { favorites, clearFavorites } = useFavorites();
  const { isConnected } = useNetworkStatus();
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    telemetry.logScreenView('Favorites');
  }, []);

  useEffect(() => {
    loadFavoriteCharacters();
  }, [favorites, isConnected]);

  const loadFavoriteCharacters = async () => {
    try {
      setLoading(true);
      
      if (favorites.length === 0) {
        setCharacters([]);
        return;
      }

      if (isConnected) {
        const charactersData = await api.getMultipleCharacters(favorites);
        setCharacters(charactersData);
      } else {
        // Modo offline - cargar desde caché
        const cached = await storage.getCachedCharacters();
        const favoriteCharacters = cached.filter((c: Character) => 
          favorites.includes(c.id)
        );
        setCharacters(favoriteCharacters);
      }
    } catch (error) {
      console.error('Error loading favorite characters:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavoriteCharacters();
  };

  const handleClearAll = () => {
    clearFavorites();
    telemetry.logEvent('CLEAR_ALL_FAVORITES', { count: favorites.length });
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View className="flex-1 items-center justify-center px-8">
        <MaterialIcons 
          name="favorite-border" 
          size={80} 
          color={themeColors.textSecondary} 
        />
        <Text 
          className="text-2xl font-bold mt-6 text-center"
          style={{ color: themeColors.text }}
        >
          Sin Favoritos
        </Text>
        <Text 
          className="text-base mt-2 text-center"
          style={{ color: themeColors.textSecondary }}
        >
          Toca el corazón en cualquier personaje para agregarlo a tus favoritos
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (favorites.length === 0) return null;

    return (
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row justify-between items-center mb-4">
          <Text 
            className="text-xl font-bold"
            style={{ color: themeColors.text }}
          >
            {favorites.length} {favorites.length === 1 ? 'Favorito' : 'Favoritos'}
          </Text>
          
          <TouchableOpacity
            onPress={handleClearAll}
            className="flex-row items-center rounded-lg px-3 py-2"
            style={{ backgroundColor: themeColors.danger + '20' }}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="delete-outline" 
              size={18} 
              color={themeColors.danger} 
            />
            <Text 
              className="ml-1 font-semibold"
              style={{ color: themeColors.danger }}
            >
              Limpiar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
      {!isConnected && <OfflineBanner />}
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CharacterCard character={item} />}
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            paddingBottom: 16,
            flexGrow: 1 
          }}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}