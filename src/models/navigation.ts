// src/types/navigation.ts

// 1. Tipos para el Stack de Autenticación
export type AuthStackParamList = {
  Welcome: undefined; // No necesita parámetros
  Login: undefined;
  Register: undefined;
};

// 2. Tipos para el Stack de la Aplicación (Logueado)
export type AppStackParamList = {
  Map: undefined;
  Profile: undefined;
  History: undefined;
  Report: undefined;
};