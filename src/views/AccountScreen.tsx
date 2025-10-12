import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// Hook para obtener el estado de autenticación del usuario
import { useAuthStatus } from '../viewmodels/useAuthStatus'; 
// Hook para manejar la lógica de cierre de sesión
import { useLogout } from '../viewmodels/useLogout'; 

// --- Mock Data ---
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

// --- Sub Component: Star Rating ---
const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      // Usando Ionicons para un look de estrella consistente
      <Ionicons 
        key={i} 
        name={i <= rating ? 'star' : 'star-outline'} 
        size={18} 
        color={i <= rating ? '#FFC107' : '#E0E0E0'} 
        style={{ marginRight: 2 }}
      />
    );
  }
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

// --- Main Component ---
const AccountScreen = () => {
  const { user, isLoading } = useAuthStatus(); 
  const navigation = useNavigation();

  // Obtener la función de logout y el estado de carga del hook useLogout
  const { logout: handleLogout, isLoggingOut } = useLogout(navigation); 

  // Fuente del avatar: Usa la foto de perfil del usuario o un placeholder público
  const avatarSource = user?.photoURL
    ? { uri: user.photoURL }
    : { uri: 'https://placehold.co/64x64/808080/FFFFFF/png?text=A' }; // Placeholder genérico

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#333' }}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    // Pantalla para usuarios no autenticados
    return (
      <View style={styles.authPromptContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#616161" />
        <Text style={styles.authPromptText}>Por favor, **inicia sesión** para ver tu cuenta.</Text>
        <TouchableOpacity 
           // Acción de ejemplo para navegar al Login
           // En una app real, navigation.navigate('Login') o similar
           style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
        {/* Botón de volver posicionado en caso de no autenticación */}
         <TouchableOpacity
           onPress={() => navigation.goBack()}
           style={[styles.backButton, { top: Platform.OS === 'ios' ? 60 : 30, left: 16, backgroundColor: 'transparent' }]}
           accessibilityLabel="Volver"
         >
           <Ionicons name="arrow-back" size={28} color="#000" />
         </TouchableOpacity>
      </View>
    );
  }

  const renderRentalItem = ({ item }: { item: typeof rentalHistory[0] }) => (
    <View style={styles.rentalCard}>
      <View style={styles.rentalHeader}>
        <Text style={styles.bikeName}>{item.bikeName}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <View style={styles.ratingRow}>
        <StarRating rating={item.rating} />
        <Text style={styles.stationName}>📍 {item.station}</Text>
      </View>
      <Text style={styles.reviewText}>{item.review}</Text>
      <TouchableOpacity style={styles.reviewActionButton}>
         <Text style={styles.reviewActionText}>Ver Detalle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botón de volver */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityLabel="Volver al mapa"
      >
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user.displayName || 'Usuario de Bicicleta'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user.email || 'Sin correo registrado'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Rental History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historial de Rentas ({rentalHistory.length})</Text>
        </View>

        <FlatList
          data={rentalHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderRentalItem}
          contentContainerStyle={styles.rentalList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
             <View style={styles.emptyState}>
                <Ionicons name="bicycle-outline" size={50} color="#BDBDBD" />
                <Text style={styles.emptyStateText}>Aún no tienes rentas registradas.</Text>
             </View>
          )}
        />
        
        {/* Logout Button (Integrado con useLogout) */}
        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && { opacity: 0.7 }]} 
          onPress={handleLogout}
          disabled={isLoggingOut} // Deshabilita el botón mientras se está cerrando sesión
          accessibilityLabel="Cerrar la sesión actual"
        >
          {isLoggingOut ? (
            // Muestra el indicador de carga si se está cerrando sesión
            <ActivityIndicator size="small" color="#D32F2F" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="log-out-outline" size={24} color="#D32F2F" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Lighter background for depth
    paddingTop: Platform.OS === 'ios' ? 100 : 80, 
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30, 
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    borderRadius: 50,
    padding: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  authPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  authPromptText: {
    fontSize: 18,
    color: '#333',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16, 
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 8, 
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatar: {
    width: 64, 
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#2196F3', 
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20, 
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sectionHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  rentalList: {
    paddingBottom: 20,
  },
  rentalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12, 
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationName: {
    fontSize: 14,
    color: '#757575',
  },
  reviewText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE', 
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30, 
    borderWidth: 1,
    borderColor: '#EF9A9A', 
  },
  logoutButtonText: {
    color: '#D32F2F', 
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#BDBDBD',
  },
  reviewActionButton: {
     marginTop: 10,
     alignSelf: 'flex-start',
     paddingHorizontal: 10,
     paddingVertical: 4,
     borderRadius: 15,
     borderWidth: 1,
     borderColor: '#E0E0E0',
  },
  reviewActionText: {
     fontSize: 12,
     fontWeight: '500',
     color: '#2196F3',
  }
});

export default AccountScreen;
