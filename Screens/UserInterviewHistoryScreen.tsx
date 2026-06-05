import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  route: RouteProp<
    RootStackParamList,
    'UserInterviewHistoryScreen'
  >;
};


export default function UserInterviewHistoryScreen({ route }: Props) {
  const { userId } = route.params;
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
  fetch(`${config.API_BASE_URL}/admin/user/${userId}/history`)
    .then(res => res.json())
    .then(data => {
      console.log('HISTORY DATA:', data);
      setHistory(data.filter((h: any) => h.interview_id));
    })
    .catch(console.error);
}, [userId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.interview_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Field: {item.field_name}</Text>
            <Text>confidence: {(item.overall_confidence).tofixed(1) ?? 'N/A'}</Text>
            <Text>knowledege: {(item.overall_knowledge).tofixed(1) ?? 'N/A'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
});
