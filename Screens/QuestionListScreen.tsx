import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  route: RouteProp<RootStackParamList, 'QuestionListScreen'>;
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'QuestionListScreen'
  >;
};


export default function QuestionListScreen({ route, navigation }: Props) {
  const { fieldId } = route.params;
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/admin/field/${fieldId}/questions`)
      .then(res => res.json())
      .then(setQuestions);
  }, [fieldId]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.add}
        onPress={() =>
          navigation.navigate('AddQuestionScreen', { fieldId })
        }
      >
        <Text style={styles.addText}>+ Add Question</Text>
      </TouchableOpacity>

      <FlatList
        data={questions}
        keyExtractor={(q) => q.question_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
  style={styles.card}
  onPress={() =>
    navigation.navigate('AnswerListScreen', { questionId: item.question_id })
  }
>
  <Text style={styles.q}>{item.question_text}</Text>
  <Text style={styles.q}>{item.level}</Text>
</TouchableOpacity>

          


        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  q: { fontWeight: 'bold' },
a: { marginTop: 5, color: '#555' },

  container: { flex: 1, padding: 16 },
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
});
