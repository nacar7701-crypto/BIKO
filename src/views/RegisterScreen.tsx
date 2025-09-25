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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
              value={name}
              onChangeText={setName}
            />
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

          {/* Botón Register */}
          <TouchableOpacity style={styles.buttonPrimary}>
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          {/* Link a Login */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? Inicia sesión aquí
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

// Estilos similares a LoginScreen (copia y ajusta si quieres variaciones)
const styles = StyleSheet.create({
  // ... (mismos estilos que en LoginScreen, agrega input extra si es necesario)
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