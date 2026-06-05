import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Screen1'>;
};

export default function Screen1({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      

      // Check role and navigate
      if (data.role === 'admin') {
        navigation.navigate('Screen5', { userName: data.name, userId: data.user_id });
      } else {
        navigation.navigate('UserDashboard', { userName: data.name, userId: data.user_id });
      }

    } else {
      Alert.alert('Error', data.error || 'Invalid credentials');
    }
  } catch (error) {
    Alert.alert('Error', 'Something went wrong');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Screen2')}>
        <Text style={styles.link}>Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  input: { width: '100%', borderWidth: 1, padding: 10, marginVertical: 8, borderRadius: 5 },
  button: { backgroundColor: '#28A745', padding: 15, borderRadius: 5, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  link: { color: '#007BFF', marginTop: 10 },
});
