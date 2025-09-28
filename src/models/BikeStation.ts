// src/models/BikeStation.ts

export interface Station {
  id: string;
  name: string;
  bikesAvailable: number; // Cantidad de bicis clásicas disponibles
  portsAvailable: number; // Puertos vacíos
  latitude: number;
  longitude: number;
}

// Datos de ejemplo centrados cerca de Puebla para simular estaciones
export const mockStations: Station[] = [
  // Estaciones cerca del centro y zonas populares de Puebla
  { id: 'st1', name: 'Zócalo - Catedral', bikesAvailable: 2, portsAvailable: 16, latitude: 19.0437, longitude: -98.2003 }, // ROJO (Pocas)
  { id: 'st2', name: 'Analco - 11 Sur', bikesAvailable: 5, portsAvailable: 10, latitude: 19.0385, longitude: -98.1960 }, // NARANJA
  { id: 'st3', name: 'Estrella de Puebla', bikesAvailable: 25, portsAvailable: 5, latitude: 19.0494, longitude: -98.2250 }, // VERDE (Muchas)
  { id: 'st4', name: 'Fuente de los Frailes', bikesAvailable: 12, portsAvailable: 8, latitude: 19.0558, longitude: -98.2120 }, // VERDE
  { id: 'st5', name: 'Barrio del Artista', bikesAvailable: 0, portsAvailable: 20, latitude: 19.0450, longitude: -98.1970 }, // ROJO (Ninguna)
  { id: 'st6', name: 'C.U. BUAP Acceso Principal', bikesAvailable: 7, portsAvailable: 13, latitude: 18.9950, longitude: -98.2005 }, // NARANJA
  { id: 'st7', name: 'Revolución - Parque', bikesAvailable: 18, portsAvailable: 2, latitude: 19.0620, longitude: -98.1945 }, // VERDE
  { id: 'st8', name: 'Avenida Juárez - 19 Sur', bikesAvailable: 4, portsAvailable: 11, latitude: 19.0525, longitude: -98.2100 }, // NARANJA
  { id: 'st9', name: 'Barrio Santiago', bikesAvailable: 1, portsAvailable: 15, latitude: 19.0490, longitude: -98.2160 }, // ROJO
];