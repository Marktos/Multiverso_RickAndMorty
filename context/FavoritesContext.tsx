import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import telemetry from '../services/telemetry';
import { FavoritesAction, FavoritesState } from '../types';
import storage from '../utils/storage';

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (id: number, name: string) => void;
  removeFavorite: (id: number, name: string) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Reducer para manejar el estado de favoritos
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_FAVORITE':
      if (state.favorites.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };

    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload),
      };

    case 'SET_FAVORITES':
      return {
        ...state,
        favorites: action.payload,
      };

    case 'CLEAR_FAVORITES':
      return {
        ...state,
        favorites: [],
      };

    default:
      return state;
  }
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, { favorites: [] });

  // Cargar favoritos al iniciar
  useEffect(() => {
    loadFavorites();
  }, []);

  // Guardar favoritos cuando cambien
  useEffect(() => {
    if (state.favorites.length >= 0) {
      storage.saveFavorites(state.favorites);
    }
  }, [state.favorites]);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await storage.getFavorites();
      dispatch({ type: 'SET_FAVORITES', payload: savedFavorites });
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const addFavorite = (id: number, name: string) => {
    dispatch({ type: 'ADD_FAVORITE', payload: id });
    telemetry.logFavoriteAdded(id, name);
  };

  const removeFavorite = (id: number, name: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: id });
    telemetry.logFavoriteRemoved(id, name);
  };

  const isFavorite = (id: number): boolean => {
    return state.favorites.includes(id);
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
    telemetry.logEvent('FAVORITES_CLEARED', { count: state.favorites.length });
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites: state.favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};