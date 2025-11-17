
// services/telemetry.ts
import { TelemetryEvent } from '../types';

class TelemetryService {
  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private log(event: TelemetryEvent): void {
    console.log('📊 [TELEMETRY]', JSON.stringify(event, null, 2));
  }

  logEvent(action: string, details: Record<string, any> = {}): void {
    const event: TelemetryEvent = {
      timestamp: this.formatTimestamp(),
      action,
      details,
    };
    this.log(event);
  }

  // Eventos específicos
  logAppStart(): void {
    this.logEvent('APP_START', { message: 'Aplicación iniciada' });
  }

  logScreenView(screenName: string): void {
    this.logEvent('SCREEN_VIEW', { screen: screenName });
  }

  logCharacterView(characterId: number, characterName: string): void {
    this.logEvent('CHARACTER_VIEW', { 
      characterId, 
      characterName 
    });
  }

  logFavoriteAdded(characterId: number, characterName: string): void {
    this.logEvent('FAVORITE_ADDED', { 
      characterId, 
      characterName 
    });
  }

  logFavoriteRemoved(characterId: number, characterName: string): void {
    this.logEvent('FAVORITE_REMOVED', { 
      characterId, 
      characterName 
    });
  }

  logFilterApplied(filterType: string, filterValue: string): void {
    this.logEvent('FILTER_APPLIED', { 
      filterType, 
      filterValue 
    });
  }

  logThemeChanged(newTheme: string): void {
    this.logEvent('THEME_CHANGED', { theme: newTheme });
  }

  logDataCleared(): void {
    this.logEvent('DATA_CLEARED', { message: 'Datos locales eliminados' });
  }

  logNetworkChange(isConnected: boolean): void {
    this.logEvent('NETWORK_CHANGE', { 
      status: isConnected ? 'online' : 'offline' 
    });
  }

  logApiError(endpoint: string, error: any): void {
    this.logEvent('API_ERROR', { 
      endpoint, 
      error: error.message || 'Unknown error' 
    });
  }
}

export default new TelemetryService();