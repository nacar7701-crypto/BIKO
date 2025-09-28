import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert, // <-- Importado para mostrar alertas
  ActivityIndicator, // <-- Importado para el estado de carga
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 1. IMPORTAR EL VIEWMODEL
import { useAuthViewModel } from '../viewmodels/AuthViewModel'; 

const LoginScreen = () => {
  const navigation = useNavigation();
  
  // 2. USAR EL VIEWMODEL
  const { loginUser } = useAuthViewModel();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga

  // 3. FUNCIÓN PARA MANEJAR EL LOGIN
  const handleLogin = async () => {
    
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingrese su email y contraseña.');
      return;
    }

    setLoading(true); // Inicia el estado de carga
    
    try {
      // LLAMADA AL VIEWMODEL
      const user = await loginUser({ email, password });
      
      // Éxito: Navegar a la pantalla principal
      Alert.alert('¡Bienvenido!', `Sesión iniciada como ${user.email}`);
      
    } catch (error: any) {
      console.error("Error de login:", error.message);
      
      // Mapeo de errores comunes para el usuario
      let message = 'Error desconocido al iniciar sesión.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          message = 'Credenciales inválidas. Email o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
          message = 'El formato del correo electrónico no es válido.';
      } else {
          message = error.message; 
      }
      
      Alert.alert('Error de Login', message);
      
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          {/* Logo */}
          <Text style={styles.logo}>Biko</Text>

          {/* Título */}
          <Text style={styles.title}>Iniciar Sesión</Text>

          {/* Form */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Botón Login */}
          <TouchableOpacity 
            style={styles.buttonPrimary}
            onPress={handleLogin} // <-- CONECTADO
            disabled={loading} // Deshabilitado durante la carga
          >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" /> // Muestra indicador si está cargando
            ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Link a Register */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.linkText}>
              ¿No tienes cuenta? Regístrate aquí
            </Text>
          </TouchableOpacity>

          {/* Skip para testing */}
          <TouchableOpacity
            style={styles.buttonSkip}
            onPress={() => navigation.navigate('BikeList' as never)}
          >
            <Text style={styles.buttonSkipText}>Saltar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

// ... (Tus estilos se mantienen sin cambios) ...
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay más oscuro para forms
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAF50', // Verde
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3', // Azul
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50', // Verde
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#2196F3', // Azul
    fontSize: 16,
    marginBottom: 20,
  },
  buttonSkip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonSkipText: {
    color: 'white',
    fontSize: 14,
  },
});

export default LoginScreen;