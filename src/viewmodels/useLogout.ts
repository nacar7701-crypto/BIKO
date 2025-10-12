// src/viewmodels/useLogout.ts

import { useState, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Alert } from 'react-native';

/**
 * Hook personalizado para manejar el cierre de sesión de Firebase.
 * Proporciona una función segura para cerrar sesión y un estado de carga.
 */
export const useLogout = (navigation: any) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await signOut(auth);
            navigation.replace('Welcome');
          } catch (error: any) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', error.message || 'No se pudo cerrar la sesión.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }, [navigation]);

  return { logout, isLoggingOut };
};