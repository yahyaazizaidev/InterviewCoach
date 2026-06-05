import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  route: RouteProp<RootStackParamList, 'FieldDetailScreen'>;
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'FieldDetailScreen'
  >;
};


export default function FieldDetailScreen({ route, navigation }: Props) {
  const { fieldId } = route.params;

  const deleteField = async () => {
    Alert.alert('Confirm', 'Delete this field?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${config.API_BASE_URL}/admin/field/${fieldId}`, {
            method: 'DELETE',
          });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('QuestionListScreen', { fieldId })
        }
      >
        <Text style={styles.text}>View Questions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.danger} onPress={deleteField}>
        <Text style={styles.text}>Delete Field</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  danger: {
    backgroundColor: '#DC3545',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 16 },
});
