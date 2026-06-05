import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  route: RouteProp<RootStackParamList, 'EditAnswerScreen'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditAnswerScreen'>;
};

export default function EditAnswerScreen({ route, navigation }: Props) {
  const { answerId, answerText: initialText } = route.params;
  const [answerText, setAnswerText] = useState(initialText);

  const updateAnswer = async () => {
    if (!answerText.trim()) {
      Alert.alert('Error', 'Answer cannot be empty');
      return;
    }

    try {
      const res = await fetch(`${config.API_BASE_URL}/admin/answer/${answerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer_text: answerText }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Answer updated', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update answer');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit Answer:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter answer text"
        value={answerText}
        onChangeText={setAnswerText}
        multiline
      />

      <TouchableOpacity style={styles.saveBtn} onPress={updateAnswer}>
        <Text style={styles.saveText}>Update Answer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#FFC107',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16 },
});
