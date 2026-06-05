import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Screen7'>;
};

type Field = {
  field_id: number;
  field_name: string;
};

export default function Screen7({ navigation }: Props) {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/admin/fields`);
      const data = await res.json();
      setFields(data);
    } catch {
      Alert.alert('Error', 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddFieldScreen')}
      >
        <Text style={styles.addText}>+ Add Field</Text>
      </TouchableOpacity>

      <FlatList
        data={fields}
        keyExtractor={(item) => item.field_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('FieldDetailScreen', { fieldId: item.field_id })
            }
          >
            <Text style={styles.name}>{item.field_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 16 },
});
