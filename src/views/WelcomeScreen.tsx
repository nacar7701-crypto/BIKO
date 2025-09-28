import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,  // Agrega este import si no está
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');  // No se usa, pero ok

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')} // Asegúrate de que exista
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Logo como Imagen (corregido) */}
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"  // Ajusta la imagen sin distorsión
        />
        
        {/* Título */}
        <Text style={styles.title}>¡Bienvenidos a Biko!</Text>
        <Text style={styles.subtitle}>La app para rentar bicicletas en tu ciudad</Text>

        {/* Botones */}
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('Register' as never)}
        >
          <Text style={styles.buttonSecondaryText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Opción skip temporal para testing */}
        <TouchableOpacity
          style={styles.buttonSkip}
          onPress={() => navigation.navigate('BikeList' as never)}
        >
          <Text style={styles.buttonSkipText}>Saltar al Catálogo</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Overlay semi-transparente para legibilidad
  },
  logo: {
    width: 150,      // Ancho fijo (ajusta según tu logo)
    height: 150,     // Alto fijo (mismo ratio para cuadrado; ajusta si es rectangular)
    marginBottom: 20,
    // Quita: fontSize, fontWeight, color (no válidos para Image)
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3', // Azul
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50', // Verde
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50', // Verde borde
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonSecondaryText: {
    color: '#4CAF50', // Verde
    fontSize: 18,
    fontWeight: 'bold',
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

export default WelcomeScreen;