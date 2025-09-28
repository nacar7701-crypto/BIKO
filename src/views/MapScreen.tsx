import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { mockStations, Station } from '../models/BikeStation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 

// Coordenadas iniciales centradas en la ciudad de Puebla, México
const INITIAL_REGION: Region = {
  latitude: 19.0414, 
  longitude: -98.2063, 
  latitudeDelta: 0.05, 
  longitudeDelta: 0.05,
};

// --- FUNCIÓN DE LÓGICA DE COLORES ---
const getMarkerColor = (bikesAvailable: number) => {
  if (bikesAvailable === 0) {
    return '#E74C3C'; // Rojo (Ninguna)
  } else if (bikesAvailable <= 4) {
    return '#FF9800'; // Naranja (Pocas)
  } else {
    return '#4CAF50'; // Verde (Muchas)
  }
};

// --- Componente para el marcador personalizado (Icono + Número + Color) ---
const CustomBikeMarker: React.FC<{ station: Station, onPress: (station: Station) => void }> = ({ station, onPress }) => {
  const color = getMarkerColor(station.bikesAvailable);
  
  return (
    <Marker
      coordinate={{ latitude: station.latitude, longitude: station.longitude }}
      onPress={() => onPress(station)} 
      // El título y la descripción aparecerán en la ventana nativa si no se usa un Custom Callout
      title={station.name} 
      description={`${station.bikesAvailable} bicis disponibles`}
    >
      {/* Contenido visual similar al de tu imagen: Icono y Número */}
      <View style={[styles.markerContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name="bike" size={14} color="white" style={{ marginRight: 2 }} />
        <Text style={styles.markerText}>{station.bikesAvailable}</Text>
      </View>
    </Marker>
  );
};

// --- Componente del Panel de Detalles (No necesita cambios, ya muestra el nombre) ---
const StationDetailPanel: React.FC<{ station: Station, onClose: () => void }> = ({ station, onClose }) => (
  <View style={styles.detailPanel}>
    <ScrollView contentContainerStyle={styles.panelScrollContent}>
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close-outline" size={24} color="#333" />
      </TouchableOpacity>

      {/* AQUÍ SE RECUPERA EL NOMBRE DE LA ESTACIÓN SELECCIONADA */}
      <Text style={styles.stationTitle}>{station.name}</Text>

      {/* Métricas: Bicis y Puertos */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{station.bikesAvailable}</Text>
          <Text style={styles.metricLabel}>clásica</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{station.portsAvailable}</Text>
          <Text style={styles.metricLabel}>puertos disponibles</Text>
        </View>
      </View>

      {/* Botón Escanear para Desbloquear */}
      <TouchableOpacity style={styles.unlockButton} onPress={() => alert('¡Iniciando escaneo QR!')}>
        <Text style={styles.unlockButtonText}>Escanear para desbloquear</Text>
      </TouchableOpacity>

      {/* Opciones Adicionales */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="bookmark-outline" size={24} color="#666" />
          <Text style={styles.optionText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <MaterialCommunityIcons name="directions" size={24} color="#666" />
          <Text style={styles.optionText}>Indicaciones</Text>
        </TouchableOpacity>
      </View>

      {/* Sección ¿Necesitas ayuda? */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
        <TouchableOpacity style={styles.helpItem}>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.helpText}>Aprende cómo viajar</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#CCC" style={styles.helpArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#333" />
          <Text style={styles.helpText}>Obtén ayuda con otro problema</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#CCC" style={styles.helpArrow} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  </View>
);


// --- EL COMPONENTE DE MAPA PRINCIPAL ---
const MapScreen = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarkerPress = (station: Station) => {
    setSelectedStation(station);
    // Podrías animar el mapa para centrar la estación aquí si lo deseas
  };
  
  // Lógica de búsqueda simulada (filtrado por nombre de estación)
  const filteredStations = mockStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.fullContainer}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        onPress={() => setSelectedStation(null)} // Cierra el panel al presionar el mapa
      >
        {filteredStations.map((station) => (
          <CustomBikeMarker key={station.id} station={station} onPress={handleMarkerPress} />
        ))}
      </MapView>

      {/* Barra de Búsqueda y Botón de Menú (Implementación de Búsqueda) */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar estación o dirección..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="options-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Panel Inferior: Detalles (si hay selección) o Inicio (si no hay) */}
      {selectedStation ? (
        <StationDetailPanel 
          station={selectedStation} 
          onClose={() => setSelectedStation(null)} 
        />
      ) : (
        <View style={styles.bottomPanel}>
          <Text style={styles.greetingText}>Hola:</Text>
          <Text style={styles.actionText}>Viajar</Text>
          <TouchableOpacity style={styles.scanButton} onPress={() => alert('¡Iniciando escaneo QR!')}>
            <Text style={styles.scanButtonText}>Escanear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


// --- ESTILOS ---
const styles = StyleSheet.create({
  fullContainer: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  // --- Estilos de Búsqueda ---
  searchContainer: {
    position: 'absolute', top: 50, left: 10, right: 10,
    flexDirection: 'row', alignItems: 'center',
    zIndex: 10,
  },
  menuButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 10,
    elevation: 4,
  },
  searchInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 8,
    paddingHorizontal: 10, height: 50,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1, fontSize: 16,
  },
  searchButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginLeft: 10,
    elevation: 4,
  },

  // --- Estilos del Marcador ---
  markerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFF',
    borderWidth: 1.5,
    elevation: 3,
  },
  markerText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 2 },
  
  // --- Panel Inferior (Home/Escanear) ---
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5,
  },
  greetingText: { fontSize: 16, color: '#666' },
  actionText: { fontSize: 24, fontWeight: 'bold', color: '#333', flexGrow: 1, marginLeft: 5 },
  scanButton: {
    backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25,
  },
  scanButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // --- Estilos del Panel de Detalles ---
  detailPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '65%', elevation: 10,
  },
  panelScrollContent: { padding: 20, paddingTop: 10 },
  closeButton: {
    position: 'absolute', top: 10, right: 10, zIndex: 10,
  },
  stationTitle: {
    fontSize: 22, fontWeight: 'bold', marginTop: 15, marginBottom: 20,
    paddingRight: 40,
  },
  metricsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#EEE',
    marginBottom: 20,
  },
  metricItem: { alignItems: 'center', flex: 1 },
  metricValue: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  metricLabel: { fontSize: 14, color: '#666' },
  metricDivider: { width: 1, backgroundColor: '#DDD', marginHorizontal: 15 },
  unlockButton: {
    backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center',
    marginBottom: 20,
  },
  unlockButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  optionsContainer: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 20,
  },
  optionItem: { alignItems: 'center' },
  optionText: { fontSize: 14, color: '#666', marginTop: 5 },
  helpSection: { paddingVertical: 10 },
  helpTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  helpItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  helpText: { fontSize: 16, color: '#333', marginLeft: 10, flexGrow: 1 },
  helpArrow: { marginLeft: 'auto' }
});

export default MapScreen;