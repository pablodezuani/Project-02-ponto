import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from '../../componentes/sidebar';

export default function HomeScreen() {
  const [points, setPoints] = useState([]);
  const [address, setAddress] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Mock user data (replace with actual user data in a real app)
  const userName = "Jéssica Carqueijeiro Barrico";
  const userPhoto = "https://i.pravatar.cc/300";

  useEffect(() => {
    loadPoints();
    getAddress();
  }, []);

  useEffect(() => {
    if (isSidebarVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isSidebarVisible]);

  const loadPoints = async () => {
    const storedPoints = await AsyncStorage.getItem('points');
    if (storedPoints) setPoints(JSON.parse(storedPoints));
  };

  const getAddress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        'Precisamos de acesso à localização para obter o endereço.'
      );
      return;
    }

    const locationData = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = locationData.coords;

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

  const savePoint = async (newPoint) => {
    const updatedPoints = [newPoint, ...points].slice(0, 5);
    setPoints(updatedPoints);
    await AsyncStorage.setItem('points', JSON.stringify(updatedPoints));
  };

  const baterPonto = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        'Precisamos de acesso à localização para bater ponto.'
      );
      return;
    }
    const locationData = await Location.getCurrentPositionAsync({});
    const newPoint = {
      timestamp: new Date().toLocaleString(),
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
      address,
    };

    await savePoint(newPoint);
    navigation.navigate('ConfirmarPonto', {
      latitude: newPoint.latitude,
      longitude: newPoint.longitude,
      address: newPoint.address,
    });
  };

  const navigateToDetail = (point) => {
    navigation.navigate('DetailScreen', { point });
  };

  const handleLogout = () => {
    // Implement logout logic here
    Alert.alert('Logout', 'Você foi desconectado com sucesso.');
    // Navigate to Login screen or perform other logout actions
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
      <View style={styles.container}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isSidebarVisible}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setSidebarVisible(false)}
            >
              <Sidebar
                navigation={navigation}
                userName={userName}
                userPhoto={userPhoto}
                onClose={() => setSidebarVisible(false)}
                onLogout={handleLogout}
                slideAnim={slideAnim}
              />
            </TouchableOpacity>
          </View>
        </Modal>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Pablo Ponto</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.balanceSection}>
            <Text style={styles.saldo}>Saldo</Text>
            <Text style={styles.balanceAmount}>00:00</Text>
          </View>

          <TouchableOpacity style={styles.punchButton} onPress={baterPonto}>
            <Ionicons name="time" size={24} color="white" />
            <Text style={styles.punchButtonText}>Bater Ponto</Text>
          </TouchableOpacity>

          <View style={styles.recentPointsSection}>
            <Text style={styles.subHeader}>Últimos 5 Pontos:</Text>
            <FlatList
              data={points}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => navigateToDetail(item)}>
                  <View style={styles.card}>
                    <Ionicons name="location-outline" size={24} color="#007BFF" />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardText}>{item.timestamp}</Text>
                      <Text style={styles.cardSubText}>
                        ({item.latitude.toFixed(6)}, {item.longitude.toFixed(6)})
                      </Text>
                      <Text style={styles.cardSubText}>Endereço: {item.address}</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={24} color="#007BFF" />
                  </View>
                </TouchableOpacity>
              )}
              style={styles.flatList}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('ControlerScreen')}
            >
              <Text style={styles.viewAllText}>Ver Todos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  menuButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  saldo: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  punchButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  punchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  recentPointsSection: {
    flex: 1,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  flatList: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    marginLeft: 15,
    flex: 1,
  },
  cardText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cardSubText: {
    color: '#555',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  viewAllButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

