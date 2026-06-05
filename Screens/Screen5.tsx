import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Screen5'>;
};
export default function Screen5({ navigation }: Props) {
    return(<View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={()=>{navigation.navigate('Screen6')}}>
                <Text style={styles.buttonText}>Users</Text>
              </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>{navigation.navigate('Screen7')}}>
                <Text style={styles.buttonText}>Fields</Text>
              </TouchableOpacity>
    </View>)
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, padding: 10, marginVertical: 8, borderRadius: 5 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, width: '100%', alignItems: 'center',margin:10 },
  buttonText: { color: '#fff', fontSize: 16 }
});