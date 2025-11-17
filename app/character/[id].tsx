import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { OfflineBanner } from '../../components/BannerSinConexion';
import { useFavorites } from '../../context/FavoritesContext';
import { colors, useTheme } from '../../context/ThemeContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import api from '../../services/api';
import telemetry from '../../services/telemetry';
import { Character, Episode } from '../../types';
import storage from '../../utils/storage';

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isConnected } = useNetworkStatus();
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);

  const characterId = parseInt(id as string);
  const favorite = character ? isFavorite(character.id) : false;

  useEffect(() => {
    loadCharacterDetail();
  }, [id, isConnected]);

  const loadCharacterDetail = async () => {
    try {
      setLoading(true);
      
      if (isConnected) {
        const characterData = await api.getCharacterById(characterId);
        setCharacter(characterData);
        telemetry.logCharacterView(characterData.id, characterData.name);
        
        // Cargar episodios
        setLoadingEpisodes(true);
        const episodesData = await api.getMultipleEpisodes(
          characterData.episode.slice(0, 10) // Limitar a 10 episodios
        );
        setEpisodes(episodesData);
        setLoadingEpisodes(false);
      } else {
        // Modo offline
        const cached = await storage.getCachedCharacters();
        const cachedCharacter = cached.find((c: Character) => c.id === characterId);
        
        if (cachedCharacter) {
          setCharacter(cachedCharacter);
          setLoadingEpisodes(false);
        }
      }
    } catch (error) {
      console.error('Error loading character detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (!character) return;
    
    if (favorite) {
      removeFavorite(character.id, character.name);
    } else {
      addFavorite(character.id, character.name);
    }
  };

  const getStatusColor = () => {
    if (!character) return themeColors.textSecondary;
    
    switch (character.status) {
      case 'Alive':
        return themeColors.success;
      case 'Dead':
        return themeColors.danger;
      default:
        return themeColors.warning;
    }
  };

  const InfoItem = ({ icon, label, value }: any) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-1">
        <MaterialIcons name={icon} size={18} color={themeColors.primary} />
        <Text 
          className="text-sm font-semibold ml-2"
          style={{ color: themeColors.textSecondary }}
        >
          {label}
        </Text>
      </View>
      <Text 
        className="text-base ml-6"
        style={{ color: themeColors.text }}
      >
        {value || 'Desconocido'}
      </Text>
    </View>
  );

  const EpisodeCard = ({ episode }: { episode: Episode }) => (
    <View 
      className="rounded-xl p-4 mb-2"
      style={{ backgroundColor: themeColors.card }}
    >
      <Text 
        className="text-base font-bold"
        style={{ color: themeColors.text }}
      >
        {episode.episode} - {episode.name}
      </Text>
      <Text 
        className="text-sm mt-1"
        style={{ color: themeColors.textSecondary }}
      >
        {episode.air_date}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View 
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: themeColors.background }}
      >
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (!character) {
    return (
      <View 
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: themeColors.background }}
      >
        <MaterialIcons 
          name="error-outline" 
          size={64} 
          color={themeColors.textSecondary} 
        />
        <Text 
          className="text-xl font-bold mt-4 text-center"
          style={{ color: themeColors.text }}
        >
          Personaje no encontrado
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
      {!isConnected && <OfflineBanner />}
      
      {/* Header */}
      <View 
        className="flex-row items-center px-4 pt-12 pb-4"
        style={{ backgroundColor: themeColors.background }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: themeColors.card }}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            color={themeColors.text} 
          />
        </TouchableOpacity>
        
        <Text 
          className="flex-1 text-lg font-bold mx-4"
          style={{ color: themeColors.text }}
          numberOfLines={1}
        >
          Detalle
        </Text>
        
        <TouchableOpacity
          onPress={handleFavoriteToggle}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: themeColors.card }}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={favorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={favorite ? themeColors.danger : themeColors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Character Image */}
        <View className="items-center px-4 pb-4">
          <Image
            source={{ uri: character.image }}
            className="w-48 h-48 rounded-3xl"
            resizeMode="cover"
          />
        </View>

        {/* Character Name and Status */}
        <View className="px-4 mb-6">
          <Text 
            className="text-3xl font-bold text-center mb-2"
            style={{ color: themeColors.text }}
          >
            {character.name}
          </Text>
          
          <View className="flex-row items-center justify-center">
            <View 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getStatusColor() }}
            />
            <Text 
              className="text-lg"
              style={{ color: themeColors.textSecondary }}
            >
              {character.status} - {character.species}
            </Text>
          </View>
        </View>

        {/* Character Info */}
        <View 
          className="mx-4 rounded-2xl p-4 mb-4"
          style={{ backgroundColor: themeColors.card }}
        >
          <Text 
            className="text-xl font-bold mb-4"
            style={{ color: themeColors.text }}
          >
            Información
          </Text>
          
          <InfoItem
            icon="person"
            label="Género"
            value={character.gender}
          />
          
          {character.type && (
            <InfoItem
              icon="category"
              label="Tipo"
              value={character.type}
            />
          )}
          
          <InfoItem
            icon="public"
            label="Origen"
            value={character.origin.name}
          />
          
          <InfoItem
            icon="location-on"
            label="Ubicación Actual"
            value={character.location.name}
          />
        </View>

        {/* Episodes */}
        {isConnected && (
          <View className="mx-4 mb-6">
            <Text 
              className="text-xl font-bold mb-4"
              style={{ color: themeColors.text }}
            >
              Episodios ({character.episode.length})
            </Text>
            
            {loadingEpisodes ? (
              <ActivityIndicator size="small" color={themeColors.primary} />
            ) : (
              <>
                {episodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
                
                {character.episode.length > 10 && (
                  <Text 
                    className="text-center text-sm mt-2"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Mostrando 10 de {character.episode.length} episodios
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {!isConnected && (
          <View className="mx-4 mb-6">
            <Text 
              className="text-center"
              style={{ color: themeColors.textSecondary }}
            >
              Conectate a internet para ver los episodios
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}