import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import config from '../config';

export default function AddQuestionScreen({ route, navigation }: any) {
  const { fieldId } = route.params;
  const [question, setQuestion] = useState('');
  const [level, setlevel] = useState('');

  const submit = async () => {
    await fetch(`${config.API_BASE_URL}/admin/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldId, question, level }),
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Question"
        style={styles.input}
        onChangeText={setQuestion}
      />
      <TextInput
        placeholder="level"
        style={styles.input}
        onChangeText={setlevel}
      />

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.text}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 16 },
});
