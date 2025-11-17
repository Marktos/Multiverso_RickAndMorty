// context/ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import telemetry from '../services/telemetry';
import { Theme, ThemeContextType } from '../types';
import storage from '../utils/storage';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');

  // Cargar tema guardado al iniciar
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await storage.getTheme();
      setTheme(savedTheme);
    } catch (error) {
      // Si hay error, usar el tema del sistema
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await storage.saveTheme(newTheme);
      telemetry.logThemeChanged(newTheme);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Colores del tema
export const colors = {
  light: {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#3B82F6',
    border: '#E5E7EB',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#60A5FA',
    border: '#374151',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
  },
};