import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  DetailScreen: { timeEntry: TimeEntry };
};

type ControlerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface TimeEntryDetail {
  type: 'ENTRADA' | 'SAIDA';
  timestamp: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface TimeEntry {
  date: string;
  entries: TimeEntryDetail[];
}

export default function ControlerScreen() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const navigation = useNavigation<ControlerScreenNavigationProp>();

  useEffect(() => {
    loadAllTimeEntries();
  }, []);

  const loadAllTimeEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('timeEntries');
      if (storedEntries) {
        const parsedEntries: TimeEntry[] = JSON.parse(storedEntries);
        setTimeEntries(parsedEntries);
      }
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { timeEntry: item })}>
      <View style={styles.card}>
        <Ionicons name="calendar-outline" size={24} color="#007BFF" />
        <View style={styles.cardContent}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <Text style={styles.entriesText}>
            Entradas: {item.entries.filter(e => e.type === 'ENTRADA').length} | 
            Saídas: {item.entries.filter(e => e.type === 'SAIDA').length}
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color="#007BFF" />
      </View>
    </TouchableOpacity>
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
        </View>

        {timeEntries.length > 0 ? (
          <FlatList
            data={timeEntries}
            renderItem={renderTimeEntry}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.noDataText}>Nenhum ponto registrado ainda.</Text>
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
    marginLeft: 16,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  entriesText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
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
  },
});

