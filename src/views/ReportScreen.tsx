// src/views/ReportScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../models/navigation';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Station } from '../models/BikeStation';
import { useAuthStatus } from '../viewmodels/useAuthStatus';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../services/firebase';

type ReportScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Report'>;

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

const REPORT_TYPES = [
  { key: 'bike_damaged', label: 'Bicicleta dañada' },
  { key: 'bike_locked', label: 'Bicicleta atascada / no se desbloquea' },
  { key: 'station_full', label: 'Estación llena (no hay puertos)' },
  { key: 'station_empty', label: 'Estación vacía (no hay bicis)' },
  { key: 'app_issue', label: 'Problema con la app' },
  { key: 'other', label: 'Otro' },
];

const ReportScreen = () => {
  const navigation = useNavigation<ReportScreenNavigationProp>();
  const { user: currentUser } = useAuthStatus();

  const [stations, setStations] = useState<Station[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Cargar estaciones
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'stations'), (snapshot) => {
      const stationList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Station[];
      setStations(stationList);
    });
    return () => unsubscribe();
  }, []);

  // Solicitar permisos para la galería
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para adjuntar fotos.');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `reports/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, blob);
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes estar logueado para enviar un reporte.');
      return;
    }

    if (!selectedType) {
      Alert.alert('Falta información', 'Por favor selecciona el tipo de queja.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Falta información', 'Por favor describe el problema.');
      return;
    }

    setSubmitting(true);
    let imageUrl = '';

    try {
      if (imageUri) {
        setUploading(true);
        imageUrl = await uploadImage(imageUri);
        setUploading(false);
      }

      const reportData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        type: selectedType,
        stationId: selectedStationId || null,
        stationName: selectedStationId
          ? stations.find(s => s.id === selectedStationId)?.name || 'No especificada'
          : 'No aplica',
        description: description.trim(),
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'reports'), reportData);

      Alert.alert(
        '¡Gracias por tu reporte!',
        'Hemos recibido tu queja y la revisaremos lo antes posible.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('Error al enviar reporte:', error);
      Alert.alert('Error', 'No se pudo enviar tu reporte. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.CARD_BG} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar un problema</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tipo de queja */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de queja *</Text>
          <View style={styles.typeGrid}>
            {REPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeButton,
                  selectedType === type.key && styles.typeButtonSelected,
                ]}
                onPress={() => setSelectedType(type.key)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type.key && styles.typeButtonTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estación (solo si aplica) */}
        {(selectedType !== 'app_issue' && selectedType !== 'other') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estación afectada</Text>
            <View style={styles.stationSelector}>
              <TouchableOpacity
                style={styles.stationButton}
                onPress={() => {
                  Alert.alert(
                    'Seleccionar estación',
                    'Elige una estación de la lista',
                    [
                      ...stations.map(station => ({
                        text: station.name,
                        onPress: () => setSelectedStationId(station.id),
                      })),
                      { text: 'Cancelar', style: 'cancel' as const }
                    ]
                  );
                }}
              >
                <Text style={styles.stationButtonText}>
                  {selectedStation ? selectedStation.name : 'Seleccionar estación...'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción del problema *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe con detalle lo que ocurrió..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Adjuntar foto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto (opcional)</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Text style={styles.imagePreviewText}>Foto seleccionada</Text>
              </View>
            ) : (
              <Text style={styles.imageButtonText}>+ Adjuntar foto</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botón de envío */}
        <TouchableOpacity
          style={[styles.submitButton, (submitting || uploading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || uploading}
        >
          {submitting || uploading ? (
            <ActivityIndicator color={COLORS.PRIMARY_TEXT} />
          ) : (
            <Text style={styles.submitButtonText}>Enviar reporte</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.MEDIUM_GREEN,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.CARD_BG,
    marginLeft: 12,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.CARD_BG,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    backgroundColor: COLORS.CARD_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  typeButtonSelected: {
    backgroundColor: COLORS.PRIMARY_FILL,
    borderColor: COLORS.MEDIUM_GREEN,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.FORM_TEXT_DARK,
  },
  typeButtonTextSelected: {
    color: COLORS.PRIMARY_TEXT,
    fontWeight: '600',
  },
  stationSelector: {
    marginTop: 8,
  },
  stationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  stationButtonText: {
    fontSize: 16,
    color: COLORS.FORM_TEXT_DARK,
    flex: 1,
  },
  textInput: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.FORM_TEXT_DARK,
    textAlignVertical: 'top',
    height: 120,
  },
  imageButton: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    fontSize: 16,
    color: COLORS.FORM_TEXT_DARK,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreviewText: {
    fontSize: 16,
    color: COLORS.FORM_TEXT_DARK,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY_FILL,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_TEXT,
  },
});

export default ReportScreen;
