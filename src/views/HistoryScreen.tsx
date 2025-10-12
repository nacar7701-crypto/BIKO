import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStatus } from '../viewmodels/useAuthStatus';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../models/navigation';

type HistoryScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'History'>;

// Definición de colores para consistencia (copiados de MapScreen)
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

// Tipo simplificado para una Reserva
interface Reservation {
  id: string;
  stationName: string;
  status: 'active' | 'expired' | 'completed';
  startTime: any; // Usaremos 'any' para manejar el Timestamp de Firestore
  minutes: number;
  estimatedCost: number;
  actualEndTime?: any;
  costFinal?: number;
}

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { user: currentUser, isLoading } = useAuthStatus();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // ---------- CARGA DE RESERVAS DEL USUARIO ----------
  useEffect(() => {
    if (isLoading || !currentUser) {
      setIsFetching(false);
      return;
    }

    // Consulta para obtener todas las reservas del usuario, ordenadas por fecha de inicio
    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', currentUser.uid),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservationList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          stationName: data.stationName,
          status: data.status,
          startTime: data.startTime,
          minutes: data.minutes,
          estimatedCost: data.estimatedCost,
          actualEndTime: data.actualEndTime,
          costFinal: data.costFinal,
        } as Reservation;
      });
      setReservations(reservationList);
      setIsFetching(false);
    }, (error) => {
      console.error("Error fetching reservations:", error);
      setIsFetching(false);
    });

    return () => unsubscribe();
  }, [currentUser, isLoading]);

  // ---------- UTILS DE FORMATO ----------
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Asegura que es un objeto Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#3498DB'; // Azul
      case 'completed':
        return COLORS.DARK_GREEN; // Verde oscuro
      case 'expired':
        return '#E74C3C'; // Rojo
      default:
        return '#95A5A6'; // Gris
    }
  };

  // ---------- RENDER ITEM ----------
  const renderItem = ({ item }: { item: Reservation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.stationTitle}>{item.stationName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.infoText}>Inicio: {formatTimestamp(item.startTime)}</Text>
        {item.status === 'completed' && <Text style={styles.infoText}>Fin: {formatTimestamp(item.actualEndTime)}</Text>}
        <Text style={styles.infoText}>Minutos reservados: {item.minutes}</Text>
          {item.status === 'completed' ? (
            <Text style={styles.costFinalText}>Costo Final: ${item.costFinal?.toFixed(2) || 'N/A'}</Text>
          ) : (
            <Text style={styles.costText}>Costo Estimado: ${item.estimatedCost.toFixed(2)}</Text>
          )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.CARD_BG} />
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Viajes</Text>
      </View>

      {/* Contenido Principal */}
      {(isLoading || isFetching) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.LIGHT_ACCENT} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : (
        reservations.length > 0 ? (
          <FlatList
            data={reservations}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={60} color={COLORS.LIGHT_ACCENT} />
            <Text style={styles.emptyText}>Aún no tienes viajes registrados. ¡Reserva una bici para comenzar!</Text>
          </View>
        )
      )}
    </View>
  );
};

// ---------------------- ESTILOS ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG, // Fondo oscuro principal
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60, // Para evitar el notch
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.MEDIUM_GREEN, // Verde oscuro para el header
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.CARD_BG, // Texto blanco para el título
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.CARD_BG, // Fondo de la tarjeta blanco
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
    marginBottom: 10,
  },
  stationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.FORM_TEXT_DARK,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.CARD_BG,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    paddingHorizontal: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  costText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MEDIUM_GREEN,
    marginTop: 5,
  },
  costFinalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.DARK_GREEN, // Más prominente para el costo final
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.LIGHT_ACCENT,
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: COLORS.LIGHT_ACCENT,
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    lineHeight: 24,
  }
});

export default HistoryScreen;