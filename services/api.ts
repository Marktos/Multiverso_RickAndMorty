// services/api.ts
import { ApiResponse, Character, Episode } from '../types';
import telemetry from './telemetry';

const BASE_URL = 'https://rickandmortyapi.com/api';

class RickAndMortyAPI {
  async getCharacters(page: number = 1, filters?: { status?: string; name?: string }): Promise<ApiResponse> {
    try {
      let url = `${BASE_URL}/character?page=${page}`;
      
      if (filters?.status) {
        url += `&status=${filters.status}`;
      }
      
      if (filters?.name) {
        url += `&name=${filters.name}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      telemetry.logApiError('/character', error);
      throw error;
    }
  }

  async getCharacterById(id: number): Promise<Character> {
    try {
      const response = await fetch(`${BASE_URL}/character/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Character = await response.json();
      return data;
    } catch (error) {
      telemetry.logApiError(`/character/${id}`, error);
      throw error;
    }
  }

  async getMultipleCharacters(ids: number[]): Promise<Character[]> {
    try {
      if (ids.length === 0) return [];
      
      const idsString = ids.join(',');
      const response = await fetch(`${BASE_URL}/character/${idsString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Si es un solo personaje, la API devuelve un objeto, no un array
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      telemetry.logApiError('/character/[ids]', error);
      throw error;
    }
  }

  async getEpisode(url: string): Promise<Episode> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Episode = await response.json();
      return data;
    } catch (error) {
      telemetry.logApiError(url, error);
      throw error;
    }
  }

  async getMultipleEpisodes(urls: string[]): Promise<Episode[]> {
    try {
      if (urls.length === 0) return [];
      
      const episodes = await Promise.all(
        urls.map(url => this.getEpisode(url))
      );
      
      return episodes;
    } catch (error) {
      telemetry.logApiError('/episodes', error);
      throw error;
    }
  }
}

export default new RickAndMortyAPI();