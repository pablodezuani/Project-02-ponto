import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

export default function ConfirmarPontoScreen({ route, navigation }) {
  const { type } = route.params;
  const [address, setAddress] = useState('');
  const [userName, setUserName] = useState('Jéssica Carqueijeiro Barrico');
  const [registrationCode, setRegistrationCode] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    getLocation();
    generateRegistrationCode();
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const generateRegistrationCode = () => {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setRegistrationCode(code);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à localização para registrar o ponto.');
      return;
    }

    const locationData = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = locationData.coords;
    setLatitude(latitude);
    setLongitude(longitude);

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

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
    }
  };

  const salvarPonto = async () => {
    if (!photo) {
      Alert.alert('Erro', 'Por favor, tire uma foto antes de confirmar o ponto.');
      return;
    }

    const timestamp = new Date().toISOString();
    const fileName = `${timestamp.replace(/[:.-]/g, '')}_${type}.jpg`;
    const newPath = `${FileSystem.documentDirectory}photos/${fileName}`;

    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}photos`, { intermediates: true });
    await FileSystem.moveAsync({ from: photo, to: newPath });

    const newPoint = {
      type,
      timestamp,
      latitude,
      longitude,
      address,
      userName,
      registrationCode,
      photoUri: newPath,
    };

    try {
      const storedPoints = await AsyncStorage.getItem('points');
      const points = storedPoints ? JSON.parse(storedPoints) : [];
      const updatedPoints = [newPoint, ...points];
      await AsyncStorage.setItem('points', JSON.stringify(updatedPoints));

      Alert.alert(
        'Ponto Registrado',
        `Código de Registro: ${registrationCode}
Hora: ${new Date(timestamp).toLocaleString()}`
      );

      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao salvar o ponto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o ponto. Tente novamente.');
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirmação de Ponto</Text>
      </View>

      <View style={styles.cameraContainer}>
        {!photo ? (
          <Camera style={styles.camera} type={CameraType.front} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                <Ionicons name="camera" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </Camera>
        ) : (
          <Image source={{ uri: photo }} style={styles.photo} />
        )}
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
            <Text style={styles.label}>Tipo de Registro:</Text>
            <Text style={styles.value}>{type}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="time-outline" size={24} color="#007BFF" style={styles.icon} />
          <View>
            <Text style={styles.label}>Hora:</Text>
            <Text style={styles.value}>{new Date().toLocaleTimeString()}</Text>
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

      <TouchableOpacity 
        style={[styles.confirmButton, !photo && styles.disabledButton]} 
        onPress={salvarPonto}
        disabled={!photo}
      >
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
  cameraContainer: {
    aspectRatio: 3/4,
    width: '100%',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  cameraButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    borderRadius: 30,
  },
  photo: {
    aspectRatio: 3/4,
    width: '100%',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

