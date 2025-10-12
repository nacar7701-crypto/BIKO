import React from 'react';
import {
  View,
  Text,
  // Eliminamos ImageBackground
  Image, 
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

// Definición de colores basada en la imagen abstracta, ahora en tonalidades verdes
const COLORS = {
  // Fondo principal: Verde muy oscuro / Bosque (similar al DARK_BG)
  DARK_BG: '#102D15', // Verde muy oscuro
  // Forma principal: Verde medio / Oliva
  MEDIUM_GREEN: '#3B6528', // Verde medio sutil
  // Acento / Brillo: Verde Neón o Lima Vibrante
  LIGHT_ACCENT: '#C0FFC0', // Verde muy claro / Menta brillante
  // Color del botón primario (Relleno)
  PRIMARY_FILL: '#86F97A', // Verde vibrante (similar al Azul vibrante anterior)
  // Color del texto del botón primario
  PRIMARY_TEXT: '#102D15', // Texto oscuro en botón claro
};

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    // El View principal establece el color de fondo oscuro y aloja las formas
    <View style={styles.container}>
      {/* Abstract Shapes (Posicionadas detrás del contenido) */}
      
      {/* 1. Gran Ola Fluida (Similar a la forma principal en la imagen) */}
      <View style={[styles.abstractShape, styles.fluidWave]} />
      
      {/* 2. Esfera Iluminada (Similar a la esfera en la esquina) */}
      <View style={[styles.abstractShape, styles.litSphere]} />
      
      {/* 3. Pequeña Sombra/Mancha (Esquina inferior) */}
      <View style={[styles.abstractShape, styles.bottomAccent]} />

      {/* Contenedor de Contenido (Reemplaza a ImageBackground) */}
      <View style={styles.contentWrapper}>
        
          {/* Logo como Imagen */}
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          
          {/* Título */}
          <Text style={styles.title}>¡Bienvenidos a Biko!</Text>
          <Text style={styles.subtitle}>La app para rentar bicicletas en tu ciudad</Text>

          {/* Contenedor para Botones Lado a Lado (Implementación del diseño) */}
          <View style={styles.buttonGroup}>
            {/* Botón Iniciar Sesión (Secundario/Contorno) */}
            <TouchableOpacity
              style={[styles.buttonSecondary, {marginBottom: 0}]}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.buttonSecondaryText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            {/* Botón Registrarse (Primario/Relleno) */}
            <TouchableOpacity
              style={[styles.buttonPrimary, {marginBottom: 0}]}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG, // Fondo base oscuro (Verde)
  },
  abstractShape: {
    position: 'absolute',
    borderRadius: 9999, // Para todas las formas curvas/circulares
  },
  
  // 1. Gran Ola Fluida (Cubre la mayor parte de la pantalla con un verde más claro)
  fluidWave: {
    width: width * 1.5,
    height: height * 1.5,
    top: -height * 0.7,
    left: -width * 0.3,
    backgroundColor: COLORS.MEDIUM_GREEN,
    opacity: 0.7,
  },
  
  // 2. Esfera Iluminada (El punto de luz en la imagen)
  litSphere: {
    width: 140,
    height: 140,
    top: height * 0.25, // Posición central superior
    right: 50,
    backgroundColor: COLORS.LIGHT_ACCENT,
    opacity: 0.9,
    // Efecto de neón/brillo
    shadowColor: COLORS.LIGHT_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
  },

  // 3. Pequeña Sombra/Mancha (En la esquina inferior izquierda)
  bottomAccent: {
    width: width * 0.6,
    height: height * 0.4,
    bottom: -height * 0.3,
    left: -width * 0.2,
    backgroundColor: COLORS.MEDIUM_GREEN,
    opacity: 0.4,
  },

  // Estilo que envuelve todo el contenido
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent', 
  },
  logo: {
    width: 150, 
    height: 150, 
    borderRadius: 75,
    marginBottom: 40,
    // Sombra para el logo (simula la esfera iluminada)
    elevation: 15,
    shadowColor: COLORS.LIGHT_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.LIGHT_ACCENT, 
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.LIGHT_ACCENT,
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 24,
    opacity: 0.8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY_FILL, // Verde vibrante relleno (Registrarse)
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    flex: 1, 
    alignItems: 'center',
    marginLeft: 10, 
    // Sombra
    elevation: 8,
    shadowColor: COLORS.PRIMARY_FILL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  buttonText: {
    color: COLORS.PRIMARY_TEXT, // Texto oscuro en botón claro (Verde oscuro)
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.LIGHT_ACCENT, // Borde Verde Claro
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
    marginRight: 10, 
  },
  buttonSecondaryText: {
    color: COLORS.LIGHT_ACCENT, // Texto Verde Claro
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSkip: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonSkipText: {
    color: COLORS.LIGHT_ACCENT,
    fontSize: 14,
    opacity: 0.4,
  },
});

export default WelcomeScreen;
