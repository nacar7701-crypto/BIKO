import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {
  collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDoc, query, where, getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Station } from '../models/BikeStation';
import { AppStackParamList } from '../models/navigation';
import { useAuthStatus } from '../viewmodels/useAuthStatus';

const { height } = Dimensions.get('window');
type MapScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Map'>;

const COLORS = {
  DARK_BG: '#102D15',
  MEDIUM_GREEN: '#3B6528',
  LIGHT_ACCENT: '#C0FFC0',
  PRIMARY_FILL: '#86F97A',
  PRIMARY_TEXT: '#102D15',
  CARD_BG: '#FFFFFF',
  FORM_TEXT_DARK: '#333333',
  DARK_GREEN: '#1E5631',
};

const INITIAL_REGION: Region = {
  latitude: 19.0414,
  longitude: -98.2063,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ---------------------- MARKER PERSONALIZADO ----------------------
const getMarkerColor = (bikesAvailable: number) => {
  if (bikesAvailable === 0) return '#E74C3C';
  if (bikesAvailable <= 4) return '#FF9800';
  return COLORS.PRIMARY_FILL;
};

const CustomBikeMarker: React.FC<{ station: Station; onPress: (station: Station) => void }> = ({ station, onPress }) => {
  const color = getMarkerColor(station.bikesAvailable);
  return (
    <Marker
      coordinate={{ latitude: station.latitude, longitude: station.longitude }}
      onPress={() => onPress(station)}
      title={station.name}
      description={`${station.bikesAvailable} bicis disponibles`}
    >
      <View style={[styles.markerContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons
          name="bike"
          size={14}
          color={station.bikesAvailable > 4 ? COLORS.PRIMARY_TEXT : 'white'}
        />
        <Text style={[styles.markerText, { color: station.bikesAvailable > 4 ? COLORS.PRIMARY_TEXT : 'white' }]}>
          {station.bikesAvailable}
        </Text>
      </View>
    </Marker>
  );
};

// ---------------------- PANEL DETALLE ----------------------
const StationDetailPanel: React.FC<{
  station: Station;
  onClose: () => void;
  onReserve: (station: Station, minutes: number) => void;
  isReservationActive: boolean;
}> = ({ station, onClose, onReserve, isReservationActive }) => {
  const COSTO_POR_MINUTO = 0.5;
  const [minutes, setMinutes] = useState<string>('15');

  const minutesNumber = Math.max(Number(minutes), 15);
  const estimatedCost = minutesNumber * COSTO_POR_MINUTO;
  const isDisabled = station.bikesAvailable === 0 || isReservationActive;

  return (
    <View style={styles.detailPanel}>
      <ScrollView contentContainerStyle={styles.panelScrollContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-outline" size={24} color={COLORS.FORM_TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.stationTitle}>{station.name}</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{station.bikesAvailable}</Text>
            <Text style={styles.metricLabel}>bicis</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{station.portsAvailable}</Text>
            <Text style={styles.metricLabel}>puertos libres</Text>
          </View>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: COLORS.FORM_TEXT_DARK, marginBottom: 5 }}>Minutos de uso (mín. 15):</Text>
          <TextInput
            keyboardType="numeric"
            value={minutes}
            onChangeText={setMinutes}
            placeholder="15"
            style={styles.timeInput}
            editable={!isDisabled}
          />
        </View>

        <Text style={styles.costText}>Costo estimado: ${estimatedCost.toFixed(2)}</Text>

        <TouchableOpacity
          style={[styles.unlockButton, isDisabled && { backgroundColor: '#ccc' }]}
          onPress={() => {
            Alert.alert(
              "Confirmar reserva",
              `¿Deseas reservar esta bicicleta por ${minutesNumber} minutos? Costo estimado: $${estimatedCost.toFixed(2)}`,
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Confirmar", onPress: () => onReserve(station, minutesNumber) }
              ]
            );
          }}
          disabled={isDisabled}
        >
          <Text style={styles.unlockButtonText}>
            {station.bikesAvailable === 0 ? 'Sin bicis disponibles' : isReservationActive ? 'Ya tienes una reserva activa' : 'Reservar bicicleta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ---------------------- MAP SCREEN ----------------------
const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { user: currentUser, isLoading } = useAuthStatus();
  const [userName, setUserName] = useState<string>('Usuario');

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [activeReservation, setActiveReservation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude:number,longitude:number}|null>(null);
  const [sortType, setSortType] = useState<'distance'|'bikes'|'ports'|'none'>('none');

  const navigateTo = (screenName: keyof AppStackParamList) => navigation.navigate(screenName);

  // ---------- NOMBRE DEL USUARIO ----------
  useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      setUserName('Usuario');
      return;
    }

    if (currentUser.displayName) {
      setUserName(currentUser.displayName);
    } else {
      const fetchUserName = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) setUserName(userDoc.data()?.name || 'Usuario');
        } catch (e) {
          console.error(e);
          setUserName('Usuario');
        }
      };
      fetchUserName();
    }
  }, [currentUser, isLoading]);

  // --------- UBICACIÓN USUARIO ---------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      }
    })();
  }, []);

  // --------- ESTACIONES ---------
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'stations'), (snapshot) => {
      const stationList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Station[];
      setStations(stationList);
    });
    return () => unsubscribe();
  }, []);

  // --------- RESERVA ACTIVA ---------
  useEffect(() => {
    if (!currentUser) return;

    const fetchActiveReservation = async () => {
      const q = query(collection(db, 'reservations'),
        where('userId','==',currentUser.uid),
        where('status','==','active')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) setActiveReservation({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      else setActiveReservation(null);
    };
    fetchActiveReservation();
  }, [currentUser]);

  // --------- CONTADOR DE RESERVA ---------
  useEffect(() => {
    if (!activeReservation?.startTime || !activeReservation?.minutes) return;

    const handleFinishReservation = async (reservationId: string) => {
      try {
        await updateDoc(doc(db, 'reservations', reservationId), {
          status: 'expired',
          actualEndTime: serverTimestamp(),
        });
        setActiveReservation(null);
      } catch (e) { console.error(e); }
    };

    const interval = setInterval(() => {
      const start = activeReservation.startTime.toDate ? activeReservation.startTime.toDate() : new Date(activeReservation.startTime);
      const end = new Date(start.getTime() + activeReservation.minutes * 60000);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Finalizado");
        clearInterval(interval);
        if (activeReservation.id) handleFinishReservation(activeReservation.id);
      } else {
        const min = Math.floor(diff / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${min}m ${sec}s`);
      }
    },1000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  // --------- RESERVAR BICI ---------
  const handleReserve = async (station: Station, minutes: number) => {
    if (!currentUser || activeReservation || station.bikesAvailable <= 0) return;
    try {
      const estimatedCost = minutes * 0.5;

      // Bloquear bici en la BD
      await updateDoc(doc(db,'stations',station.id), { bikesAvailable: station.bikesAvailable-1 });

      // Crear reserva
      const reservationRef = await addDoc(collection(db,'reservations'),{
        userId: currentUser.uid,
        stationId: station.id,
        stationName: station.name,
        status: 'active',
        startTime: serverTimestamp(),
        minutes,
        estimatedCost
      });

      // Actualizar estado local y mostrar resumen
      setActiveReservation({ id: reservationRef.id, stationName: station.name, minutes, estimatedCost, startTime: new Date() });
      setSelectedStation(null);

      Alert.alert(
        "Reserva confirmada",
        `Bicicleta reservada en ${station.name} por ${minutes} minutos. Costo estimado: $${estimatedCost.toFixed(2)}`
      );
    } catch(e){ console.error(e); }
  };

  // --------- FILTRADO Y ORDENAMIENTO ---------
  const filteredStations = useMemo(() => {
    let filtered = stations.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (sortType === 'bikes') filtered.sort((a,b) => b.bikesAvailable - a.bikesAvailable);
    else if (sortType === 'ports') filtered.sort((a,b) => b.portsAvailable - a.portsAvailable);
    else if (sortType === 'distance' && userLocation) {
      filtered.sort((a,b) => {
        const distA = Math.hypot(a.latitude - userLocation.latitude, a.longitude - userLocation.longitude);
        const distB = Math.hypot(b.latitude - userLocation.latitude, b.longitude - userLocation.longitude);
        return distA - distB;
      });
    }

    return filtered;
  }, [stations, searchQuery, sortType, userLocation]);

  return (
    <View style={styles.fullContainer}>
      <View style={styles.mapContainer}>
        <MapView style={styles.mapInner} initialRegion={INITIAL_REGION} showsUserLocation onPress={()=>setSelectedStation(null)}>
          {filteredStations.map(station => <CustomBikeMarker key={station.id} station={station} onPress={setSelectedStation} />)}
        </MapView>
      </View>

      {/* Barra superior */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={()=>navigateTo('Profile')}><Ionicons name="person-circle-outline" size={30} color={COLORS.PRIMARY_FILL}/></TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={()=>navigateTo('History')}><Ionicons name="list-circle-outline" size={30} color={COLORS.PRIMARY_FILL}/></TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={()=>navigateTo('Report')}><Ionicons name="alert-circle-outline" size={30} color={COLORS.PRIMARY_FILL}/></TouchableOpacity>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon}/>
          <TextInput style={styles.searchInput} placeholder="Buscar estación..." placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery}/>
        </View>
      </View>

      {/* Botones filtro */}
      <View style={{flexDirection:'row', position:'absolute', top:110, left:10, right:10, zIndex:10}}>
        <TouchableOpacity onPress={()=>setSortType('bikes')} style={{marginRight:10,backgroundColor:COLORS.PRIMARY_FILL,padding:8,borderRadius:10}}><Text>Más bicis</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setSortType('ports')} style={{marginRight:10,backgroundColor:COLORS.PRIMARY_FILL,padding:8,borderRadius:10}}><Text>Más puertos</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setSortType('distance')} style={{marginRight:10,backgroundColor:COLORS.PRIMARY_FILL,padding:8,borderRadius:10}}><Text>Cercanas</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setSortType('none')} style={{backgroundColor:COLORS.PRIMARY_FILL,padding:8,borderRadius:10}}><Text>Default</Text></TouchableOpacity>
      </View>

      {selectedStation ? (
        <StationDetailPanel station={selectedStation} onClose={()=>setSelectedStation(null)} onReserve={handleReserve} isReservationActive={!!activeReservation}/>
      ) : (
        <View style={styles.bottomPanel}>
          {activeReservation ? (
            <View>
              <Text style={styles.actionText}>Reserva activa 🚲</Text>
              <Text style={styles.infoText}>Estación: {activeReservation.stationName}</Text>
              <Text style={styles.infoText}>Tiempo restante: {timeLeft || "Calculando..."}</Text>
              <Text style={styles.infoText}>Costo: ${activeReservation.estimatedCost.toFixed(2)}</Text>
            </View>
          ) : (
            <Text style={styles.actionText}>Escoge una bici para comenzar 🚴</Text>
          )}
        </View>
      )}
    </View>
  );
};

// ---------------------- ESTILOS ----------------------
const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: COLORS.DARK_BG },
  mapContainer: { ...StyleSheet.absoluteFillObject, marginBottom: height/4 },
  mapInner: { ...StyleSheet.absoluteFillObject },
  searchContainer: { position:'absolute', top:55, left:10, right:10, flexDirection:'row', alignItems:'center', zIndex:10 },
  menuButton: { padding:8, backgroundColor:COLORS.CARD_BG, borderRadius:12, marginRight:10, elevation:6 },
  searchInputWrapper: { flex:1, flexDirection:'row', alignItems:'center', backgroundColor:COLORS.CARD_BG, borderRadius:12, paddingHorizontal:10, height:50, elevation:6 },
  searchIcon:{ marginRight:8 },
  searchInput:{ flex:1, fontSize:16, color:COLORS.FORM_TEXT_DARK },
  markerContainer:{ flexDirection:'row', paddingHorizontal:8, paddingVertical:4, borderRadius:20, justifyContent:'center', alignItems:'center', borderColor:'#FFF', borderWidth:1.5, elevation:3 },
  markerText:{ fontWeight:'bold', fontSize:16, marginLeft:2 },
  bottomPanel:{ position:'absolute', bottom:0, left:0, right:0, height:height/4, backgroundColor:COLORS.MEDIUM_GREEN, padding:20, borderTopLeftRadius:20, borderTopRightRadius:20, elevation:10 },
  greetingText:{ fontSize:18, color:COLORS.LIGHT_ACCENT, marginBottom:5 },
  actionText:{ fontSize:22, fontWeight:'bold', color:COLORS.CARD_BG, marginBottom:10 },
  infoText:{ color:COLORS.CARD_BG, fontSize:16 },
  detailPanel:{ position:'absolute', bottom:0, left:0, right:0, backgroundColor:COLORS.CARD_BG, borderTopLeftRadius:20, borderTopRightRadius:20, maxHeight:'65%', elevation:10 },
  panelScrollContent:{ padding:20, paddingTop:10 },
  closeButton:{ position:'absolute', top:10, right:10 },
  stationTitle:{ fontSize:22, fontWeight:'bold', marginTop:15, marginBottom:20, color:COLORS.FORM_TEXT_DARK },
  metricsContainer:{ flexDirection:'row', justifyContent:'space-between', paddingBottom:20, borderBottomWidth:1, borderBottomColor:'#EEE', marginBottom:20 },
  metricItem:{ alignItems:'center', flex:1 },
  metricValue:{ fontSize:32, fontWeight:'bold', color:COLORS.FORM_TEXT_DARK },
  metricLabel:{ fontSize:14, color:'#666' },
  metricDivider:{ width:1, backgroundColor:'#DDD', marginHorizontal:15 },
  timeInput:{ borderWidth:1, borderColor:'#CCC', borderRadius:10, padding:10, color:COLORS.FORM_TEXT_DARK },
  costText:{ fontSize:16, color:COLORS.DARK_GREEN, marginBottom:15, fontWeight:'600' },
  unlockButton:{ backgroundColor:COLORS.PRIMARY_FILL, padding:15, borderRadius:15, alignItems:'center', marginBottom:20 },
  unlockButtonText:{ color:COLORS.PRIMARY_TEXT, fontSize:18, fontWeight:'bold' },
});

export default MapScreen;
