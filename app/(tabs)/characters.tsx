import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OfflineBanner } from '../../components/BannerSinConexion';
import { CharacterCard } from '../../components/CardPesonajes';
import { colors, useTheme } from '../../context/ThemeContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import api from '../../services/api';
import telemetry from '../../services/telemetry';
import { Character } from '../../types';
import storage from '../../utils/storage';

export default function CharactersScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { isConnected } = useNetworkStatus();
  const params = useLocalSearchParams();
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    telemetry.logScreenView('Characters');
    
    // Si viene un filtro de la pantalla Home
    if (params.filter) {
      setStatusFilter(params.filter as string);
    }
  }, []);

  useEffect(() => {
    loadCharacters(true);
  }, [statusFilter, isConnected]);

  const loadCharacters = async (reset: boolean = false) => {
    if (!hasMore && !reset) return;
    
    try {
      const currentPage = reset ? 1 : page;
      setLoading(reset);
      
      if (isConnected) {
        const filters: any = {};
        if (statusFilter) filters.status = statusFilter;
        if (searchQuery) filters.name = searchQuery;
        
        const response = await api.getCharacters(currentPage, filters);
        
        const newCharacters = reset 
          ? response.results 
          : [...characters, ...response.results];
        
        setCharacters(newCharacters);
        setHasMore(response.info.next !== null);
        setPage(currentPage + 1);
        
        // Guardar en caché
        await storage.cacheCharacters(newCharacters);
      } else {
        // Modo offline
        const cached = await storage.getCachedCharacters();
        let filtered = cached;
        
        if (statusFilter) {
          filtered = cached.filter((c: Character) => 
            c.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }
        
        setCharacters(filtered);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    telemetry.logEvent('SEARCH', { query: searchQuery });
    setPage(1);
    setHasMore(true);
    loadCharacters(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadCharacters(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && isConnected) {
      loadCharacters(false);
    }
  };

  const clearFilter = () => {
    setStatusFilter('');
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <ActivityIndicator 
        size="large" 
        color={themeColors.primary} 
        className="my-4" 
      />
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="items-center justify-center py-20">
        <MaterialIcons 
          name="search-off" 
          size={64} 
          color={themeColors.textSecondary} 
        />
        <Text 
          className="text-lg mt-4"
          style={{ color: themeColors.textSecondary }}
        >
          No se encontraron personajes
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
      {!isConnected && <OfflineBanner />}
      
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center">
          <View 
            className="flex-1 flex-row items-center rounded-xl px-3 py-2 mr-2"
            style={{ backgroundColor: themeColors.card }}
          >
            <MaterialIcons 
              name="search" 
              size={20} 
              color={themeColors.textSecondary} 
            />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: themeColors.text }}
              placeholder="Buscar personaje..."
              placeholderTextColor={themeColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              editable={isConnected}
            />
          </View>
          
          {isConnected && (
            <TouchableOpacity
              onPress={handleSearch}
              className="rounded-xl p-3"
              style={{ backgroundColor: themeColors.primary }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Badge */}
        {statusFilter && (
          <View className="flex-row mt-2">
            <View 
              className="flex-row items-center rounded-full px-3 py-1"
              style={{ backgroundColor: themeColors.primary + '20' }}
            >
              <Text 
                className="text-sm font-semibold mr-2"
                style={{ color: themeColors.primary }}
              >
                {statusFilter}
              </Text>
              <TouchableOpacity onPress={clearFilter}>
                <MaterialIcons 
                  name="close" 
                  size={16} 
                  color={themeColors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Characters List */}
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CharacterCard character={item} />}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}