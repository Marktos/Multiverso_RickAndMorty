import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { colors, useTheme } from '../context/ThemeContext';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const router = useRouter();

  const favorite = isFavorite(character.id);

  const handleFavoriteToggle = () => {
    if (favorite) {
      removeFavorite(character.id, character.name);
    } else {
      addFavorite(character.id, character.name);
    }
  };

  const handlePress = () => {
    router.push({
      pathname: '/character/[id]',
      params: { id: String(character.id) }
    });
  }

  const getStatusColor = () => {
    switch (character.status) {
      case 'Alive':
        return themeColors.success;
      case 'Dead':
        return themeColors.danger;
      default:
        return themeColors.textSecondary;
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="mb-4 rounded-xl overflow-hidden"
      style={{ backgroundColor: themeColors.card }}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        <Image 
          source={{ uri: character.image }}
          className="w-24 h-24"
          resizeMode="cover"
        />
        
        <View className="flex-1 p-3 justify-between">
          <View>
            <Text 
              className="text-lg font-bold mb-1"
              style={{ color: themeColors.text }}
              numberOfLines={1}
            >
              {character.name}
            </Text>
            
            <View className="flex-row items-center mb-1">
              <View 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getStatusColor() }}
              />
              <Text 
                className="text-sm"
                style={{ color: themeColors.textSecondary }}
              >
                {character.status} - {character.species}
              </Text>
            </View>
            
            <Text 
              className="text-xs"
              style={{ color: themeColors.textSecondary }}
              numberOfLines={1}
            >
              📍 {character.location.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleFavoriteToggle}
          className="p-3 justify-center"
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={favorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={favorite ? themeColors.danger : themeColors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};