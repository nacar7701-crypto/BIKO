import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

// Importa tus vistas
import WelcomeScreen from './src/views/WelcomeScreen';
import LoginScreen from './src/views/LoginScreen';
import RegisterScreen from './src/views/RegisterScreen';
import MapScreen from './src/views/MapScreen'; // <-- NUEVA PANTALLA DE MAPA

// Importa el hook de estado de autenticación
import { useAuthStatus } from './src/viewmodels/useAuthStatus'; 

const Stack = createNativeStackNavigator();

// --- Pilas de Navegación ---

// 1. Pantallas para usuarios NO logueados
const AuthStack = () => (
  <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// 2. Pantallas para usuarios logueados
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* La pantalla principal después del Login */}
    <Stack.Screen name="MapScreen" component={MapScreen} /> 
    {/* Aquí irían otras pantallas de la app, como Perfil, etc. */}
  </Stack.Navigator>
);

export default function App() {
  const { user, isLoading } = useAuthStatus();

  // Muestra un indicador de carga mientras Firebase verifica la sesión (es muy rápido)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Si hay un usuario logueado, muestra el AppStack (Mapa). Si no, el AuthStack. */}
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333'
  }
});

// Nota: Asegúrate de que el hook useAuthStatus.ts exista y esté correcto.