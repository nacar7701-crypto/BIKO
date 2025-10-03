// src/views/AccountScreen.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStatus } from '../viewmodels/useAuthStatus';

const rentalHistory = [
  {
    id: 'r1',
    bikeName: 'Bicicleta Urbana A',
    station: 'Estación Central',
    rating: 4,
    review: 'Muy cómoda y en buen estado. Ideal para trayectos cortos.',
    date: '2025-05-10',
  },
  {
    id: 'r2',
    bikeName: 'Bicicleta Eléctrica B',
    station: 'Estación Sur',
    rating: 5,
    review: 'Excelente batería y suave manejo. ¡Volveré a rentarla!',
    date: '2025-04-22',
  },
  {
    id: 'r3',
    bikeName: 'Bicicleta Plegable A',
    station: 'Estación Norte',
    rating: 3,
    review: 'Buena, pero el asiento estaba un poco incómodo.',
    date: '2025-03-15',
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={{ color: i <= rating ? '#FFC107' : '#E0E0E0', fontSize: 16 }}>
        ★
      </Text>
    );
  }
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

const AccountScreen = () => {
  const { user, isLoading } = useAuthStatus();
  const navigation = useNavigation();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No hay usuario autenticado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón de volver - solo ícono, sin fondo */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityLabel="Volver al mapa"
      >
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Image
            source={require('../../assets/images/avatar.jpg')}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.displayName || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user.email || 'Sin correo'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historial de Rentas</Text>
        </View>

        <FlatList
          data={rentalHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.rentalCard}>
              <View style={styles.rentalHeader}>
                <Text style={styles.bikeName}>{item.bikeName}</Text>
                <Text style={styles.stationName}>📍 {item.station}</Text>
              </View>
              <StarRating rating={item.rating} />
              <Text style={styles.reviewText}>{item.review}</Text>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          )}
          contentContainerStyle={styles.rentalList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // ✅ Bajamos más el contenido
    paddingTop: Platform.OS === 'ios' ? 100 : 80, 
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30, 
    left: 16,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  rentalList: {
    paddingBottom: 20,
  },
  rentalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  rentalHeader: {
    marginBottom: 8,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  stationName: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  reviewText: {
    fontSize: 14,
    color: '#000000',
    marginTop: 6,
    lineHeight: 18,
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

export default AccountScreen;