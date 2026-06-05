import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  route: RouteProp<RootStackParamList, 'AnswerListScreen'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'AnswerListScreen'>;
};

type Answer = {
  answer_id: number;
  answer_text: string;
};

export default function AnswerListScreen({ route, navigation }: Props) {
  const { questionId } = route.params;
  const [answers, setAnswers] = useState<Answer[]>([]);

  const fetchAnswers = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/admin/question/${questionId}/answers`);
      const data = await res.json();
      setAnswers(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load answers');
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  const deleteAnswer = async (answerId: number) => {
    Alert.alert('Confirm', 'Delete this answer?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${config.API_BASE_URL}/admin/answer/${answerId}`, {
            method: 'DELETE',
          });
          fetchAnswers(); // refresh list
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      

      <TouchableOpacity
        style={styles.add}
        onPress={() =>
          navigation.navigate('AddAnswerScreen', { questionId })
        }
      >
        <Text style={styles.addText}>+ Add Answer</Text>
      </TouchableOpacity>

      <FlatList
        data={answers}
        keyExtractor={(a) => a.answer_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.a}>{item.answer_text}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate('EditAnswerScreen', { answerId: item.answer_id, answerText: item.answer_text })
                }
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteAnswer(item.answer_id)}
              >
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  add: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 16 },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  a: { fontSize: 16 },
  editBtn: { padding: 6, backgroundColor: '#FFC107', marginRight: 8, borderRadius: 4 },
  deleteBtn: { padding: 6, backgroundColor: '#DC3545', borderRadius: 4 },
});
