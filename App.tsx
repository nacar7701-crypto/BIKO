// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import { Provider } from 'mobx-react-lite';
//import { bikeViewModel } from './src/viewmodels/BikeViewModel'; // Si ya lo tienes
import WelcomeScreen from './src/views/WelcomeScreen';
import LoginScreen from './src/views/LoginScreen';
import RegisterScreen from './src/views/RegisterScreen';
//import BikeListScreen from './src/views/BikeListScreen'; // De antes
//import ProfileScreen from './src/views/ProfileScreen'; // De antes

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    //<Provider bikeViewModel={bikeViewModel}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }} // Oculta header en bienvenida
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login', headerStyle: { backgroundColor: '#4CAF50' } }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Registro', headerStyle: { backgroundColor: '#4CAF50' } }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    //</Provider>
  );
}