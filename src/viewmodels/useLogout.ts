import { useState, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; // Asegúrate de que esta ruta sea correcta para tu configuración de Firebase
import { Alert } from 'react-native';

/**
 * Hook personalizado para manejar el cierre de sesión de Firebase.
 * Proporciona una función segura para cerrar sesión y un estado de carga.
 * @param navigation Objeto de navegación para redirigir al usuario.
 */
export const useLogout = (navigation: any) => {
  // Estado para indicar si el proceso de cierre de sesión está en curso
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Función para mostrar la alerta de confirmación y ejecutar el cierre de sesión.
   * Utiliza useCallback para memoizar la función y evitar recreaciones innecesarias.
   */
  const logout = useCallback(() => {
    // Usamos Alert.alert para confirmar la acción con el usuario
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión y volver a la pantalla de bienvenida?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // 1. Ejecutar el cierre de sesión de Firebase
              await signOut(auth); 
              
              // 2. Redirigir al usuario a la pantalla de bienvenida o login
              // Se usa replace para que el usuario no pueda volver atrás a la pantalla de la cuenta.
              navigation.replace('Welcome'); 

            } catch (error: any) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error al salir', error.message || 'No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.');
            } finally {
              // Siempre restablecer el estado de carga
              setIsLoggingOut(false);
            }
          },
        },
      ],
      // Opciones de configuración adicionales (ej: no cancelable)
      { cancelable: false }
    );
  }, [navigation]); // Dependencia en navigation para evitar errores de linting

  return { logout, isLoggingOut };
};
