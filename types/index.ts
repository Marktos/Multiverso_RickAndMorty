export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface ApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface FavoritesState {
  favorites: number[];
}

export type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: number }
  | { type: 'REMOVE_FAVORITE'; payload: number }
  | { type: 'SET_FAVORITES'; payload: number[] }
  | { type: 'CLEAR_FAVORITES' };

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface TelemetryEvent {
  timestamp: string;
  action: string;
  details: Record<string, any>;
}