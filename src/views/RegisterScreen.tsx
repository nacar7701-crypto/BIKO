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
  Alert, // <--- Importado para mostrar mensajes
  ActivityIndicator, // <--- Importado para el estado de carga
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 1. IMPORTAR EL VIEWMODEL Y EL MODEL
import { useAuthViewModel } from '../viewmodels/AuthViewModel';
import { RegisterData } from '../models/User'; // Asegúrate de que esta interfaz exista

const RegisterScreen = () => {
  const navigation = useNavigation();
  
  // 2. Usar el ViewModel (Hook)
  const { registerUser } = useAuthViewModel();
  
  // 3. Unificar el estado de los datos del formulario
  const [formData, setFormData] = useState<RegisterData>({
    displayName: '', 
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga

  // Función genérica para actualizar el estado del formulario
  const handleInputChange = (name: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. Implementar la función de registro
  const handleRegister = async () => {
    const { displayName, email, password } = formData;
    
    // Validaciones básicas
    if (!displayName || !email || !password) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }
    if (password.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    setLoading(true); // Inicia el estado de carga
    
    try {
      // 5. LLAMADA AL VIEWMODEL para la lógica de Firebase
      await registerUser(formData);
      
      Alert.alert('¡Éxito!', 'Cuenta creada correctamente. ¡Inicia sesión para empezar!');
      // Redirigir al Login después de un registro exitoso
      navigation.navigate('Login' as never); 
      
    } catch (error: any) {
      console.error("Error de registro:", error.message);
      
      // Muestra un mensaje de error limpio al usuario
      const errorMessage = error.message || 'Error desconocido al registrar.';
      Alert.alert('Error de Registro', errorMessage);
      
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
          <Text style={styles.title}>Registrarse</Text>

          {/* Form */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nombre Completo"
              value={formData.displayName}
              onChangeText={(text) => handleInputChange('displayName', text)} 
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)} 
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)} 
              secureTextEntry
            />
          </View>

          {/* Botón Register (con lógica de carga) */}
          <TouchableOpacity 
            style={styles.buttonPrimary} 
            onPress={handleRegister} 
            disabled={loading} 
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" /> 
            ) : (
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Link a Login */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Text>
          </TouchableOpacity>

          {/* Skip para testing (Recuerda actualizar el nombre a MapScreen si cambias la navegación) */}
          <TouchableOpacity
            style={styles.buttonSkip}
            onPress={() => navigation.navigate('MapScreen' as never)}
          >
            <Text style={styles.buttonSkipText}>Saltar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
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
    backgroundColor: '#4CAF50',
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
    color: '#2196F3',
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

export default RegisterScreen;