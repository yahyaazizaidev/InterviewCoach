import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import config from '../config';
type Screen3RouteProp = RouteProp<RootStackParamList, 'Screen3'>;
type Screen3NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Screen3'>;
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type Props = {
  route: Screen3RouteProp;
  navigation: Screen3NavigationProp;
};

type Field = {
  field_id: number;
  field_name: string;
};

export default function Screen3({ route, navigation }: Props) {
  const { userName, userId } = route.params;
  const [selectedLevel, setSelectedLevel] = useState<string>('Easy');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [selectedfeature, setSelectedfeature] = useState<string>("wpm");
  // inside Screen3
useFocusEffect(
  useCallback(() => {
    // Reset selectedField and selectedLevel every time screen is focused
    setSelectedField(null);
    setSelectedLevel('Easy');
  }, [])
);

  // Fetch fields from backend
  useEffect(() => {
    fetch(`${config.API_BASE_URL}/fields`)
      .then(res => res.json())
      .then(data => setFields(data))
      .catch(err => Alert.alert('Error', 'Cannot fetch fields'));
  }, []);

  // Start Interview
  const startInterview = async () => {
    if (!selectedField) {
      Alert.alert('Error', 'Please select a field first');
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          field_id: selectedField,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const interviewId = data.interview_id;
        navigation.replace('Screen10', {
  userName: userName,
  userId: userId,
  field_id: selectedField,
  interview_id: interviewId,
  level:selectedLevel,
});

      } else {
        Alert.alert('Error', data.error || 'Cannot start interview');
      }
    } catch (error) {
      Alert.alert('Error', 'Server not reachable');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {userName} 👋</Text>
      </View>

      {/* Field Selection */}
      <Text style={styles.label}>Select Field:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedField}
          onValueChange={(itemValue) => setSelectedField(itemValue)}
        >
          <Picker.Item label="-- Select Field --" value={null} />
          {fields.map(field => (
            <Picker.Item key={field.field_id} label={field.field_name} value={field.field_id} />
          ))}
        </Picker>
      </View>
      {/* Level Selection */}
      <Text style={styles.label}>Select Level:</Text>
      <View style={styles.pickerContainer}>
      <Picker
         selectedValue={selectedLevel}
         onValueChange={(itemValue) => setSelectedLevel(itemValue)}
      >
      <Picker.Item label="Easy" value="Easy" />
      <Picker.Item label="Medium" value="Medium" />
      <Picker.Item label="Hard" value="Hard" />
      </Picker>
      </View>
      {/* Start Interview Button */}
      <TouchableOpacity style={styles.button} onPress={startInterview}>
        <Text style={styles.buttonText}>Start Interview</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  welcome: { fontSize: 22, fontWeight: 'bold',marginTop:10 },
  historyButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  historyText: { color: '#fff', fontWeight: 'bold' },
  label: { fontSize: 18, marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderRadius: 5, marginBottom: 20 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
