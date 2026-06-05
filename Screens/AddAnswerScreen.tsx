import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  route: RouteProp<RootStackParamList, 'AddAnswerScreen'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddAnswerScreen'>;
};

export default function AddAnswerScreen({ route, navigation }: Props) {
  const { questionId } = route.params;
  const [answerText, setAnswerText] = useState('');

  const addAnswer = async () => {
    if (!answerText.trim()) {
      Alert.alert('Error', 'Answer cannot be empty');
      return;
    }

    try {
      const res = await fetch(`${config.API_BASE_URL}/admin/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, answer_text: answerText }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Answer added', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to add answer');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>New Answer:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter answer text"
        value={answerText}
        onChangeText={setAnswerText}
        multiline
      />

      <TouchableOpacity style={styles.saveBtn} onPress={addAnswer}>
        <Text style={styles.saveText}>Add Answer</Text>
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
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16 },
});
