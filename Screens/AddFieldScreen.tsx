import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';
type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'AddFieldScreen'
  >;
};

export default function AddFieldScreen({ navigation }: Props) {
  const [fieldName, setFieldName] = useState('');

  const addField = async () => {
    if (!fieldName.trim()) {
      Alert.alert('Error', 'Field name is required');
      return;
    }

    try {
      const res = await fetch(`${config.API_BASE_URL}/admin/field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_name: fieldName }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.error || 'Failed to add field');
        return;
      }

      Alert.alert('Success', 'Field added successfully');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Server error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Field</Text>

      <TextInput
        placeholder="Field Name"
        style={styles.input}
        value={fieldName}
        onChangeText={setFieldName}
      />

      <TouchableOpacity style={styles.button} onPress={addField}>
        <Text style={styles.buttonText}>Save Field</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16 },
});
