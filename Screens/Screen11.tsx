import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import config from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Screen11'>;


interface InterviewHistory {
  interview_id: number;
  overall_confidence: number;
  overall_knowledge: number;
  field_name: string;
}

const BASE_URL = config.API_BASE_URL;

export default function Screen11({ navigation, route }: Props) {
  const { user_id, userName } = route.params;

  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewHistory();
  }, [user_id]);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BASE_URL}/interview_Score?user_id=${user_id}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setHistory(data);
    } catch (err: any) {
      const message = err.message || 'Network request failed';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewPress = (interview_id: number) => {
    navigation.navigate('HistoryInHistory', {
      interview_id, // ✅ ONLY THIS
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#34C759';
    if (score >= 50) return '#FF9500';
    return '#FF3B30';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userName}</Text>
      <Text style={styles.subtitle}>Your Interview History</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInterviewHistory}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No interview history found.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.interview_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handleInterviewPress(item.interview_id)}
            >
              <Text style={styles.fieldText}>{item.field_name}</Text>

              <View style={styles.scoresContainer}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Confidence</Text>
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: getScoreColor(item.overall_confidence) },
                    ]}
                  >
                    {(item.overall_confidence)}%
                  </Text>
                </View>

                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Knowledge</Text>
                  <Text
                    style={[
                      styles.scoreValue,
                      {
                        color: getScoreColor(item.overall_knowledge * 100),
                      },
                    ]}
                  >
                    {(item.overall_knowledge * 100)}%
                  </Text>
                </View>
              </View>

              <Text style={styles.viewDetailsText}>Tap to view details →</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: 'gray',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  fieldText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  viewDetailsText: {
    marginTop: 10,
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'right',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});
