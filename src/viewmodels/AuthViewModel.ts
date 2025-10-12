// src/viewmodels/AuthViewModel.ts

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, // <-- NUEVO: Importado para el Login
  updateProfile, 
  User 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Importa tus servicios y modelos
import { auth, db } from '../services/firebase'; 
import { RegisterData } from '../models/User'; 

// NUEVO: Interfaz para los datos mínimos de login
interface LoginData {
  email: string;
  password: string;
}

/**
 * Hook personalizado (ViewModel) para la gestión de autenticación.
 */
export const useAuthViewModel = () => {

  /**
   * Registra un nuevo usuario en Firebase Auth y guarda sus datos iniciales en Firestore.
   * @param data Objeto con displayName, email y password.
   * @returns La promesa del objeto User de Firebase.
   */
  const registerUser = async (data: RegisterData): Promise<User> => {
    
    const { email, password, displayName } = data;
    
    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      const user = userCredential.user;

      // 2. Actualizar el perfil (guardar el nombre en el registro de Auth)
      await updateProfile(user, { displayName });

      // 3. Guardar los datos adicionales del usuario en Cloud Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email,
        displayName: displayName,
        createdAt: new Date(),
      });

      return user; 
      
    } catch (error) {
      // Relanza el error para que la View lo capture y muestre la alerta
      throw error; 
    }
  };

  /**
   * Valida las credenciales e inicia sesión con Firebase Authentication.
   * @param data Objeto con email y password.
   * @returns La promesa del objeto User de Firebase.
   */
  const loginUser = async (data: LoginData): Promise<User> => {
    
    const { email, password } = data;
    
    try {
      // Usa signInWithEmailAndPassword para validar las credenciales
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      // Si tiene éxito, devuelve el objeto User de Firebase
      return userCredential.user; 
      
    } catch (error) {
      // Relanza el error para que LoginScreen.tsx lo maneje
      throw error; 
    }
  };
  
  // Exportamos ambas funciones para que las Views puedan usarlas
  return { 
    registerUser,
    loginUser 
  };
};