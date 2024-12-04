import React, { useEffect, useState } from 'react';
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
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from '../../componentes/sidebar';

interface TimeEntry {
  date: string;
  entries: {
    type: 'ENTRADA' | 'SAIDA';
    timestamp: string;
    latitude: number;
    longitude: number;
    address: string;
  }[];
  bankBalance: number; // Novo campo para armazenar o saldo do dia
}

export default function HomeScreen() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [address, setAddress] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [totalBankBalance, setTotalBankBalance] = useState(0);
  const navigation = useNavigation();

  // Mock user data (replace with actual user data in a real app)
  const userName = "Jéssica Carqueijeiro Barrico";
  const userPhoto = "https://i.pravatar.cc/300";

  useEffect(() => {
    loadTimeEntries();
    getAddress();
  }, []);

  const loadTimeEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('timeEntries');
      if (storedEntries) {
        const parsedEntries: TimeEntry[] = JSON.parse(storedEntries);
        const updatedEntries = parsedEntries.map(calculateDailyBankBalance);
        setTimeEntries(updatedEntries.slice(0, 5)); // Get only the last 5 days
        const total = updatedEntries.reduce((sum, entry) => sum + entry.bankBalance, 0);
        setTotalBankBalance(total);
      }
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

  const calculateDailyBankBalance = (entry: TimeEntry): TimeEntry => {
    const sortedEntries = [...entry.entries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    let totalMinutes = 0;
    for (let i = 0; i < sortedEntries.length; i += 2) {
      if (i + 1 < sortedEntries.length) {
        const start = new Date(sortedEntries[i].timestamp);
        const end = new Date(sortedEntries[i + 1].timestamp);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      }
    }

    const bankBalance = totalMinutes - (9 * 60); // 9 hours in minutes
    return { ...entry, bankBalance };
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

  const saveTimeEntry = async (type: 'ENTRADA' | 'SAIDA') => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        'Precisamos de acesso à localização para registrar o ponto.'
      );
      return;
    }
    const locationData = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = locationData.coords;

    navigation.navigate('ConfirmarPonto', {
      type,
      latitude,
      longitude,
      address,
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Você foi desconectado com sucesso.');
    navigation.navigate('Login');
  };

  const formatBankBalance = (minutes: number) => {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const remainingMinutes = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '+';
    return `${sign}${hours}h${remainingMinutes.toString().padStart(2, '0')}m`;
  };

  const hasIrregularEntries = (entries: TimeEntry['entries']) => {
    const entradas = entries.filter(e => e.type === 'ENTRADA').length;
    const saidas = entries.filter(e => e.type === 'SAIDA').length;
    return entradas !== saidas || entradas > 1 || saidas > 1;
  };

  const renderTimeEntryItem = ({ item }: { item: TimeEntry }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { timeEntry: item })}>
      <View style={styles.card}>
        <Ionicons name="calendar-outline" size={24} color="#007BFF" />
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>{new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          <Text style={styles.cardSubText}>
            Entradas: {item.entries.filter(e => e.type === 'ENTRADA').length} | 
            Saídas: {item.entries.filter(e => e.type === 'SAIDA').length}
          </Text>
          <Text style={[styles.bankBalanceText, item.bankBalance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
            Saldo: {formatBankBalance(item.bankBalance)}
          </Text>
        </View>
        {hasIrregularEntries(item.entries) && (
          <Ionicons name="alert-circle" size={24} color="#FFA500" style={styles.alertIcon} />
        )}
        <Ionicons name="chevron-forward-outline" size={24} color="#007BFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSidebarVisible}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View>
                  <Sidebar
                    navigation={navigation}
                    userName={userName}
                    userPhoto={userPhoto}
                    onClose={() => setSidebarVisible(false)}
                    onLogout={handleLogout}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Pablo Ponto</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.totalBankBalanceContainer}>
            <Text style={styles.totalBankBalanceLabel}>Saldo Total do Banco de Horas:</Text>
            <Text style={[styles.totalBankBalanceValue, totalBankBalance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
              {formatBankBalance(totalBankBalance)}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.punchButton} onPress={() => saveTimeEntry('ENTRADA')}>
              <Ionicons name="log-in-outline" size={24} color="white" />
              <Text style={styles.punchButtonText}>Registrar Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.punchButton, styles.exitButton]} onPress={() => saveTimeEntry('SAIDA')}>
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text style={styles.punchButtonText}>Registrar Saída</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentPointsSection}>
            <Text style={styles.subHeader}>Últimos 5 dias registrados:</Text>
            <FlatList
              data={timeEntries}
              renderItem={renderTimeEntryItem}
              keyExtractor={(item) => item.date}
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
  totalBankBalanceContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalBankBalanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  totalBankBalanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  punchButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  exitButton: {
    backgroundColor: '#DC3545',
    marginRight: 0,
    marginLeft: 10,
  },
  punchButtonText: {
    color: 'white',
    fontSize: 16,
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
  bankBalanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  positiveBalance: {
    color: '#28A745',
  },
  negativeBalance: {
    color: '#DC3545',
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
  alertIcon: {
    marginRight: 10,
  },
});

