import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DetailScreen({ route }) {
  const { point } = route.params;
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(point.timestamp));

  const selectFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      // Here you would typically handle the file, perhaps uploading it or storing its reference
      Alert.alert('Arquivo selecionado', `Nome: ${result.name}`);
    }
  };

  const handleAjuste = () => {
    Alert.alert(
      'Solicitar Ajuste',
      'Deseja solicitar um ajuste para este ponto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: () => {
            // Here you would typically send the adjustment request to your backend
            Alert.alert('Ajuste Solicitado', 'Sua solicitação de ajuste foi enviada com sucesso.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007BFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Ponto</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={24} color="#007BFF" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Data e Hora:</Text>
              <Text style={styles.value}>{point.timestamp}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={24} color="#007BFF" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Localização:</Text>
              <Text style={styles.value}>
                Latitude: {point.latitude.toFixed(6)}, Longitude: {point.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="map-outline" size={24} color="#007BFF" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Endereço:</Text>
              <Text style={styles.value}>{point.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.adjustmentSection}>
          <Text style={styles.sectionTitle}>Solicitar Ajuste</Text>
          
          <TouchableOpacity style={styles.button} onPress={selectFile}>
            <Ionicons name="document-attach-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Selecionar Arquivo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Data: {date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleAjuste}>
            <Ionicons name="send-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Enviar Solicitação de Ajuste</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  adjustmentSection: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#28A745',
  },
});

