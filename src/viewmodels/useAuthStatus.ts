// src/viewmodels/useAuthStatus.ts

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase'; // Importa el objeto 'auth' de tu servicio

/**
 * Hook para escuchar el estado de autenticación de Firebase en tiempo real.
 * Proporciona el usuario actual y si la carga inicial ha terminado.
 */
export const useAuthStatus = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Indica si Firebase terminó de verificar la sesión

  useEffect(() => {
    // onAuthStateChanged se ejecuta inmediatamente para verificar la sesión.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Será null si no hay sesión
      setIsLoading(false);  // La verificación inicial terminó
    });

    // La función de limpieza desuscribe el listener al desmontar el hook.
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
};