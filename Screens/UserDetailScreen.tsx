import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  route: RouteProp<RootStackParamList, 'UserDetailScreen'>;
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'UserDetailScreen'
  >;
};


export default function UserDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/admin/user/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, []);

  const deleteUser = async () => {
    Alert.alert('Confirm', 'Delete this user?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${config.API_BASE_URL}/admin/user/${userId}`, {
            method: 'DELETE',
          });
          navigation.goBack();
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      <Text>{user.email}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('UserInterviewHistoryScreen', { userId })
        }
      >
        <Text style={styles.btnText}>View Interview History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.danger} onPress={deleteUser}>
        <Text style={styles.btnText}>Delete User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  button: {
    backgroundColor: '#007BFF',
    padding: 14,
    marginTop: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  danger: {
    backgroundColor: '#DC3545',
    padding: 14,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16 },
});
