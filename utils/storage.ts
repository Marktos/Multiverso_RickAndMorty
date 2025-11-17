import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAVORITES: '@multiverso_hub_favorites',
  THEME: '@multiverso_hub_theme',
  CHARACTERS_CACHE: '@multiverso_hub_characters_cache',
};

class StorageService {
  // Favoritos
  async saveFavorites(favorites: number[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  }

  async getFavorites(): Promise<number[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // Tema
  async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  }

  async getTheme(): Promise<'light' | 'dark'> {
    try {
      const theme = await AsyncStorage.getItem(KEYS.THEME);
      return (theme as 'light' | 'dark') || 'light';
    } catch (error) {
      console.error('Error getting theme:', error);
      return 'light';
    }
  }

  // Cache de personajes para modo offline
  async cacheCharacters(characters: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CHARACTERS_CACHE, JSON.stringify(characters));
    } catch (error) {
      console.error('Error caching characters:', error);
    }
  }

  async getCachedCharacters(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CHARACTERS_CACHE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached characters:', error);
      return [];
    }
  }

  // Limpiar todos los datos
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.FAVORITES,
        KEYS.THEME,
        KEYS.CHARACTERS_CACHE,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export default new StorageService();