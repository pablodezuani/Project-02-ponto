import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, StackNavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

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
  bankBalance: number;
}

type RootStackParamList = {
  Home: undefined;
  DetailScreen: { timeEntry: TimeEntry };
};

type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DetailScreen'>;

export default function DetailScreen({ route }) {
  const { timeEntry: initialTimeEntry }: { timeEntry: TimeEntry } = route.params;
  const [timeEntry, setTimeEntry] = useState<TimeEntry>(initialTimeEntry);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntryDetail | null>(null);
  const navigation = useNavigation<DetailScreenNavigationProp>();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatBankBalance = (minutes: number) => {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const remainingMinutes = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '+';
    return `${sign}${hours}h${remainingMinutes.toString().padStart(2, '0')}m`;
  };

  const hasIrregularEntries = (entries: TimeEntryDetail[]) => {
    const entradas = entries.filter(e => e.type === 'ENTRADA').length;
    const saidas = entries.filter(e => e.type === 'SAIDA').length;
    return entradas !== saidas || entradas > 1 || saidas > 1;
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const addEntry = async (type: 'ENTRADA' | 'SAIDA') => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à localização para registrar o ponto.');
      return;
    }

    const locationData = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = locationData.coords;

    let address = '';
    try {
      const location = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (location.length > 0) {
        const { street, city, region } = location[0];
        address = `${street}, ${city} - ${region}`;
      }
    } catch (error) {
      console.error('Error getting address:', error);
      address = 'Endereço não disponível';
    }

    const newEntry: TimeEntryDetail = {
      type,
      timestamp: new Date().toISOString(),
      latitude,
      longitude,
      address,
    };

    const updatedEntries = [...timeEntry.entries, newEntry].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const updatedTimeEntry = {
      ...timeEntry,
      entries: updatedEntries,
    };

    setTimeEntry(updatedTimeEntry);
    await updateStoredTimeEntries(updatedTimeEntry);
  };

  const removeEntry = async (index: number) => {
    const updatedEntries = timeEntry.entries.filter((_, i) => i !== index);
    const updatedTimeEntry = {
      ...timeEntry,
      entries: updatedEntries,
    };

    setTimeEntry(updatedTimeEntry);
    await updateStoredTimeEntries(updatedTimeEntry);
  };

  const updateStoredTimeEntries = async (updatedTimeEntry: TimeEntry) => {
    try {
      const storedEntries = await AsyncStorage.getItem('timeEntries');
      if (storedEntries) {
        const parsedEntries: TimeEntry[] = JSON.parse(storedEntries);
        const updatedEntries = parsedEntries.map(entry => 
          entry.date === updatedTimeEntry.date ? updatedTimeEntry : entry
        );
        await AsyncStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
      }
    } catch (error) {
      console.error('Error updating stored time entries:', error);
    }
  };

  const editEntryTime = (entry: TimeEntryDetail) => {
    setEditingEntry(entry);
    setShowDatePicker(true);
  };

  const onDateChange = async (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && editingEntry) {
      const updatedEntry = { ...editingEntry, timestamp: selectedDate.toISOString() };
      const updatedEntries = timeEntry.entries.map(e => 
        e === editingEntry ? updatedEntry : e
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const updatedTimeEntry = {
        ...timeEntry,
        entries: updatedEntries,
      };

      setTimeEntry(updatedTimeEntry);
      await updateStoredTimeEntries(updatedTimeEntry);
    }
    setEditingEntry(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007BFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Dia</Text>
          <TouchableOpacity onPress={toggleEditing} style={styles.editButton}>
            <Ionicons name={isEditing ? "close" : "create-outline"} size={24} color="#007BFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.date}>
              {new Date(timeEntry.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
            {hasIrregularEntries(timeEntry.entries) && (
              <Ionicons name="alert-circle" size={24} color="#FFA500" style={styles.alertIcon} />
            )}
          </View>
          <Text style={[styles.bankBalance, timeEntry.bankBalance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
            Saldo do dia: {formatBankBalance(timeEntry.bankBalance)}
          </Text>
          {timeEntry.entries.map((entry, index) => (
            <View key={index} style={styles.entryContainer}>
              <View style={styles.entryHeader}>
                <Ionicons 
                  name={entry.type === 'ENTRADA' ? 'log-in-outline' : 'log-out-outline'} 
                  size={24} 
                  color={entry.type === 'ENTRADA' ? '#28A745' : '#DC3545'} 
                />
                <Text style={[styles.entryType, { color: entry.type === 'ENTRADA' ? '#28A745' : '#DC3545' }]}>
                  {entry.type}
                </Text>
                <TouchableOpacity onPress={() => editEntryTime(entry)} disabled={!isEditing}>
                  <Text style={[styles.entryTime, isEditing && styles.editableText]}>
                    {formatTime(entry.timestamp)}
                  </Text>
                </TouchableOpacity>
                {isEditing && (
                  <TouchableOpacity onPress={() => removeEntry(index)} style={styles.removeButton}>
                    <Ionicons name="trash-outline" size={24} color="#DC3545" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.entryDetails}>
                <Text style={styles.entryAddress}>{entry.address}</Text>
                <Text style={styles.entryCoordinates}>
                  Lat: {entry.latitude.toFixed(6)}, Long: {entry.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          ))}
          {isEditing && (
            <View style={styles.addButtonsContainer}>
              <TouchableOpacity style={[styles.addButton, styles.entradaButton]} onPress={() => addEntry('ENTRADA')}>
                <Ionicons name="log-in-outline" size={24} color="white" />
                <Text style={styles.addButtonText}>Adicionar Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, styles.saidaButton]} onPress={() => addEntry('SAIDA')}>
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text style={styles.addButtonText}>Adicionar Saída</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {showDatePicker && editingEntry && (
        <DateTimePicker
          value={new Date(editingEntry.timestamp)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bankBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  positiveBalance: {
    color: '#28A745',
  },
  negativeBalance: {
    color: '#DC3545',
  },
  entryContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 15,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  entryTime: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
  },
  editableText: {
    textDecorationLine: 'underline',
    color: '#007BFF',
  },
  entryDetails: {
    marginLeft: 34,
  },
  entryAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  entryCoordinates: {
    fontSize: 12,
    color: '#777',
  },
  alertIcon: {
    marginLeft: 10,
  },
  removeButton: {
    padding: 5,
  },
  addButtonsContainer: {
    marginTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  entradaButton: {
    backgroundColor: '#28A745',
  },
  saidaButton: {
    backgroundColor: '#DC3545',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
});

