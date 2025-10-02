import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase';
import { Ionicons } from '@expo/vector-icons';

// --- Define tu RootStackParamList según tus screens ---
type RootStackParamList = {
  LoginScreen: undefined;
  Register: undefined;
  HomeScreen: undefined;
  MapScreen: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

const { height, width } = Dimensions.get('window');

const COLORS = {
  DARK_BG: '#102D15',
  MEDIUM_GREEN: '#3B6528',
  LIGHT_ACCENT: '#C0FFC0',
  PRIMARY_FILL: '#86F97A',
  PRIMARY_TEXT: '#102D15',
  CARD_BG: '#FFFFFF',
  FORM_TEXT_DARK: '#333333',
};

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mantener sesión activa si ya hay token
  useEffect(() => {
    const checkSession = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Si hay token, reemplazar stack a MapScreen
        navigation.replace('MapScreen');
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
  setErrorMessage('');
  if (!email || !password) {
    setErrorMessage('Por favor, ingrese su email y contraseña.');
    return;
  }

  setLoading(true);
  try {
    // Iniciar sesión con Firebase Auth
    await signInWithEmailAndPassword(auth, email, password);

    // Obtener token JWT de Firebase
    const idToken = await auth.currentUser?.getIdToken(true); // true fuerza refresco

    // Guardar token en AsyncStorage para sesión persistente
    if (idToken) {
      await AsyncStorage.setItem('userToken', idToken);
    }

    Alert.alert(
      "Inicio de sesión exitoso",
      `Bienvenido ${auth.currentUser?.displayName || auth.currentUser?.email}!`,
      [
        {
          text: "OK",
       onPress: () => navigation.replace('MapScreen'),
        }
      ]
    );

  } catch (error: any) {
    console.error('Error de inicio de sesión:', error.message);
    setErrorMessage('Credenciales incorrectas. Inténtalo de nuevo.');
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.background}>
      {/* Abstract Shapes */}
      <View style={[styles.abstractShape, styles.fluidWave]} />
      <View style={[styles.abstractShape, styles.litSphere]} />
      <View style={[styles.abstractShape, styles.bottomAccent]} />

      {/* Logo flotante */}
      <Image 
        source={require('../../assets/images/logo.png')} 
        style={styles.logoCircle} 
        resizeMode="contain" 
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.cardContainer}>
          <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
          <Text style={styles.description}>
            Introduce tus credenciales para acceder a tu cuenta.
          </Text>

          <View style={styles.inputContainer}>
            {/* Email */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Contraseña"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.PRIMARY_TEXT} />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.DARK_BG },
  container: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  abstractShape: { position: 'absolute', borderRadius: 9999 },
  fluidWave: {
    width: width * 1.5,
    height: height * 1.5,
    top: -height * 0.5,
    left: -width * 0.5,
    backgroundColor: COLORS.MEDIUM_GREEN,
    opacity: 0.7,
  },
  litSphere: {
    width: 140,
    height: 140,
    top: height * 0.10,
    right: 40,
    backgroundColor: COLORS.LIGHT_ACCENT,
    opacity: 0.9,
    shadowColor: COLORS.LIGHT_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
  },
  bottomAccent: {
    width: width * 0.7,
    height: height * 0.5,
    bottom: height * 0.1,
    left: -width * 0.2,
    backgroundColor: COLORS.MEDIUM_GREEN,
    opacity: 0.4,
  },
  logoCircle: {
    position: 'absolute',
    top: height * 0.15 - 25,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.MEDIUM_GREEN,
    zIndex: 10,
    borderWidth: 5,
    borderColor: COLORS.CARD_BG,
    elevation: 15,
    shadowColor: COLORS.LIGHT_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    left: (width / 2) - 75,
  },
  cardContainer: {
    width: '100%',
    minHeight: height * 0.6,
    backgroundColor: COLORS.CARD_BG,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.FORM_TEXT_DARK, marginBottom: 10 },
  description: { fontSize: 16, color: COLORS.FORM_TEXT_DARK, textAlign: 'center', marginBottom: 40, opacity: 0.6 },
  inputContainer: { width: '100%', marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 5,
    fontSize: 16,
    color: COLORS.FORM_TEXT_DARK,
  },
  icon: { marginRight: 8 },
  eyeIcon: { padding: 5 },
  errorText: { color: 'red', marginBottom: 15, fontSize: 14 },
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY_FILL,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.PRIMARY_FILL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  buttonText: { color: COLORS.PRIMARY_TEXT, fontSize: 18, fontWeight: 'bold' },
  linkText: { color: COLORS.MEDIUM_GREEN, fontSize: 16, marginTop: 10, textDecorationLine: 'underline' },
});

export default LoginScreen;
