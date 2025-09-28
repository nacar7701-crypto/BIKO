// src/services/firebase.ts (SIN PERSISTENCIA)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // <--- Volvemos a getAuth
import { getFirestore } from 'firebase/firestore'; 

// 1. Ya no necesitamos importar ni usar AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyAox9BcemjaVUcFwh2NpDTjCBSjtxauCMI",
  authDomain: "biko-c8174.firebaseapp.com",
  projectId: "biko-c8174",
  storageBucket: "biko-c8174.firebasestorage.app",
  messagingSenderId: "953566095557",
  appId: "1:953566095557:web:5511c2df3a2df789ed68ac"
};

const app = initializeApp(firebaseConfig);

// 2. Volvemos a la inicialización simple que SÍ funciona:
export const auth = getAuth(app); 

export const db = getFirestore(app);