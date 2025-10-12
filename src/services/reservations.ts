import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase'; // 🔑 usamos auth real
import { Station } from '../models/BikeStation';

export interface Reservation {
  id?: string;
  stationId: string;
  stationName: string;
  userId: string;
  startTime: string;
  estimatedCost: number;
}

export const reserveBike = async (station: Station): Promise<Reservation> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const reservation: Reservation = {
    stationId: station.id,
    stationName: station.name,
    userId: user.uid,
    startTime: new Date().toLocaleString(),
    estimatedCost: 25, // 🔧 luego podemos hacerlo dinámico
  };

  const docRef = await addDoc(collection(db, "reservations"), {
    ...reservation,
    createdAt: serverTimestamp(),
  });

  return { ...reservation, id: docRef.id };
};
