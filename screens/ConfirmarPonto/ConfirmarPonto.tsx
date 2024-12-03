import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmarPontoScreen({ route, navigation }) {
  const { latitude, longitude } = route.params;
  const [address, setAddress] = useState('');
  const [userName, setUserName] = useState('Jéssica Carqueijeiro Barrico');
  const [registrationCode, setRegistrationCode] = useState('');

  useEffect(() => {
    getAddress();
    generateRegistrationCode();
  }, []);

  const generateRegistrationCode = () => {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setRegistrationCode(code);
  };

  const getAddress = async () => {
    try {
      const location = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (location.length > 0) {
        const { street, city, region } = location[0];
        setAddress(`${street}, ${city} - ${region}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter o endereço.');
    }
  };

  const salvarPonto = async () => {
    const newPoint = {
      timestamp: new Date().toLocaleString(),
      latitude,
      longitude,
      address,
      userName,
      registrationCode,
    };

    const storedPoints = await AsyncStorage.getItem('points');
    const points = storedPoints ? JSON.parse(storedPoints) : [];
    const updatedPoints = [newPoint, ...points].slice(0, 5);
    await AsyncStorage.setItem('points', JSON.stringify(updatedPoints));

    Alert.alert(
      'Ponto Registrado',
      `Código de Registro: ${registrationCode}\nHora: ${newPoint.timestamp}`
    );

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirmação de Ponto</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Ionicons name="person-outline" size={24} color="#007BFF" style={styles.icon} />
          <View>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="briefcase-outline" size={24} color="#007BFF" style={styles.icon} />
          <View>
            <Text style={styles.label}>Cargo:</Text>
            <Text style={styles.value}>Médico</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="time-outline" size={24} color="#007BFF" style={styles.icon} />
          <View>
            <Text style={styles.label}>Carga Horária:</Text>
            <Text style={styles.value}>Seg a Sex 08:00 às 17:00</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={24} color="#007BFF" style={styles.icon} />
          <View>
            <Text style={styles.label}>Localização:</Text>
            <Text style={styles.value}>
              Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="map-outline" size={24} color="#007BFF" style={styles.icon} />
          <View>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{address || 'Carregando endereço...'}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="barcode-outline" size={24} color="#007BFF" style={styles.icon} />
          <View>
            <Text style={styles.label}>Código de Registro:</Text>
            <Text style={styles.value}>{registrationCode}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={salvarPonto}>
        <Ionicons name="checkmark-circle-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Validar e Bater Ponto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
    width: '80%',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

