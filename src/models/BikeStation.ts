// src/models/BikeStation.ts

export interface Station {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    bikesAvailable: number;
    portsAvailable: number;
    
    // ✅ CORRECCIÓN: Agregar la propiedad faltante
    isReserved?: boolean; // Es opcional o debería ser un valor por defecto
}