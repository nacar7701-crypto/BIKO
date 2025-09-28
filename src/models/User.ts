// src/models/User.ts

// Interfaz para los datos que se necesitan para el registro
export interface RegisterData {
  displayName: string;
  email: string;
  password: string;
}

// Interfaz para el objeto del usuario que se guardará en Firestore
export interface UserModel {
  uid: string; 
  displayName: string;
  email: string;
  createdAt: Date;
}