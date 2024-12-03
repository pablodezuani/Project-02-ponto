import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ControlerScreen() {
  const [points, setPoints] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadAllPoints();
  }, []);

  const loadAllPoints = async () => {
    try {
      const storedPoints = await AsyncStorage.getItem('points');
      if (storedPoints) {
        const parsedPoints = JSON.parse(storedPoints);
        const sortedPoints = parsedPoints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPoints(sortedPoints);
      }
    } catch (error) {
      console.error('Error loading points:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const navigateToDetail = (point) => {
    navigation.navigate('DetailScreen', { point });
  };

  const renderPointItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.dateInfo}>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString('pt-BR')}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#007BFF" />
          <Text style={styles.location}>{item.address}</Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={28} color="#28A745" />
          <Text style={styles.statusText}>Registrado</Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigateToDetail(item)}
        >
          <Ionicons name="information-circle-outline" size={24} color="#007BFF" />
          <Text style={styles.detailsButtonText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#007BFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Controle de Ponto</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profile}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Jéssica Carqueijeiro Barrico</Text>
            <View style={styles.bankBalanceContainer}>
              <Ionicons name="time" size={18} color="#FF3B30" />
              <Text style={styles.bankBalance}>Saldo do banco: -01:50</Text>
            </View>
          </View>
        </View>

        {points.length > 0 ? (
          <FlatList
            data={points}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderPointItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.noDataText}>Nenhum ponto registrado ainda.</Text>
            <TouchableOpacity style={styles.addPointButton} onPress={() => navigation.navigate('Home')}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.addPointButtonText}>Registrar Ponto</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007BFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007BFF',
    padding: 16,
    elevation: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bankBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankBalance: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 6,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateInfo: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  actionContainer: {
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#28A745',
    marginTop: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F3FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#007BFF',
    marginLeft: 4,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addPointButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addPointButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

