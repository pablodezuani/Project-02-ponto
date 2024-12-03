import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AjusteScreen() {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const navigation = useNavigation();

  const selectFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      setFile(result);
    }
  };

  const handleSubmit = () => {
    if (!file || !reason) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    Alert.alert('Ajuste Enviado', `Arquivo: ${file.name}\nData: ${date.toLocaleDateString()}\nMotivo: ${reason}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007BFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Ajuste de Ponto</Text>
          </View>

          <View style={styles.content}>
            <TouchableOpacity style={styles.button} onPress={selectFile}>
              <Ionicons name="document-attach-outline" size={24} color="white" />
              <Text style={styles.buttonText}>
                {file ? `Arquivo: ${file.name}` : 'Selecionar Arquivo'}
              </Text>
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

            <TextInput
              placeholder="Motivo do Ajuste"
              value={reason}
              onChangeText={setReason}
              style={styles.input}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Ionicons name="send-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Enviar Ajuste</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#28A745',
  },
});

