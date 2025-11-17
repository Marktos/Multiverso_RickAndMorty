import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import telemetry from '../services/telemetry';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar estado inicial
    NetInfo.fetch().then(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      setIsLoading(false);
      telemetry.logNetworkChange(connected);
    });

    // Suscribirse a cambios en la red
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;
      
      if (connected !== isConnected) {
        setIsConnected(connected);
        telemetry.logNetworkChange(connected);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isConnected, isLoading };
};