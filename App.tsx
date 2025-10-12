import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

import WelcomeScreen from './src/views/WelcomeScreen';
import LoginScreen from './src/views/LoginScreen';
import RegisterScreen from './src/views/RegisterScreen';
import MapScreen from './src/views/MapScreen'; 
import { useAuthStatus } from './src/viewmodels/useAuthStatus'; 
import AccountScreen from './src/views/AccountScreen';
import ReportScreen from './src/views/ReportScreen';
import HistoryScreen from './src/views/HistoryScreen';

const Stack = createNativeStackNavigator();

// --- Stack para autenticación (Welcome → Login → Register) ---
const AuthStack = () => (
  <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="Report" component={ReportScreen} /> 
  </Stack.Navigator>
);

// --- Stack para usuario logueado (MapScreen y futuras pantallas) ---
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MapScreen" component={MapScreen} />
    <Stack.Screen name="History" component={HistoryScreen} /> 
    <Stack.Screen name="Report" component={ReportScreen} /> 
    {/* Aquí podrías agregar Perfil, Configuración, etc. */}
  </Stack.Navigator>
);

export default function App() {
  const { user, isLoading } = useAuthStatus();

  // Indicador de carga mientras Firebase verifica la sesión
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
      {/* Si hay un usuario logueado, muestra AppStack; si no, AuthStack */}
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
