import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import config from '../config';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  HistoryInHistory: {
    interview_id: number;
    userId?: number;
    userName?: string;
  };
  Screen3: {
    userId: number;
    userName: string;
  };
  VideoScreen: {
    video_url: string;
  };
};

type FeedbackType = {
  feature: string;
  your: string | number;
  ideal: string | number;
  percentage: number; // changed from status
  feedback: string;
};

type ScoreType = {
  question_id: number;
  confidence: number;
  knowledge: number;
  video_url?: string;
  feedback: FeedbackType[];
};

type OverallResultType = {
  overall_confidence: number;
  overall_knowledge: number;
  attempts: AttemptType[];
};

type AttemptType = {
  attempt_number: number;
  questions: ScoreType[];
};


type Props = NativeStackScreenProps<RootStackParamList, 'HistoryInHistory'>;

const getScoreColor = (score: number) => {
  if (score >= 70) return '#34C759';
  if (score >= 50) return '#FF9500';
  return '#FF3B30';
};

export default function HistoryInHistory({ route, navigation }: Props) {
  const { interview_id, userId, userName } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OverallResultType | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const fetchSavedResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(
        `${config.API_BASE_URL}/get_overall_history/${interview_id}`
      );

      if (!res.ok) {
        throw new Error(`Failed to load results: ${res.status}`);
      }

      const data = await res.json();

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received');
      }

      const parsedAttempts = (data.attempts || []).map((attempt: any) => ({
  attempt_number: attempt.attempt_number,
  questions: attempt.questions.map((q: any) => ({
    ...q,
    feedback: q.feedback ? JSON.parse(q.feedback) : [],
  })),
}));

      setResults({
  overall_confidence: data.overall_confidence || 0,
  overall_knowledge: data.overall_knowledge || 0,
  attempts: parsedAttempts,
});
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [interview_id]);

  useEffect(() => {
    fetchSavedResults();
  }, [fetchSavedResults]);

  const toggleQuestionDetails = useCallback((key: string) => {
  setExpandedQuestions(prev =>
    prev.includes(key)
      ? prev.filter(i => i !== key)
      : [...prev, key]
  );
}, []);


  const handleRetry = () => {
    fetchSavedResults();
  };

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading interview results...</Text>
          <Text style={styles.loadingSub}>Please wait</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Error loading results</Text>
          <Text style={styles.loadingSub}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No results found</Text>
          <Text style={styles.loadingSub}>No data available for this interview</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Interview Results</Text>
        <Text style={styles.headerSub}>Interview ID: {interview_id}</Text>
        <Text></Text>
      </View>

      {/* OVERALL SCORES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Performance</Text>

        <View style={styles.overallRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Confidence</Text>
            <Text
              style={[
                styles.scoreValue,
                { color: getScoreColor(results.overall_confidence) },
              ]}
            >
              {(results.overall_confidence).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Knowledge</Text>
            <Text
              style={[
                styles.scoreValue,
                { color: getScoreColor(results.overall_knowledge * 100) },
              ]}
            >
              {(results.overall_knowledge * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* QUESTION WISE ANALYSIS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Question-wise Analysis</Text>
        {results.attempts.map((attempt, attemptIndex) => (
  <View key={attemptIndex} style={styles.card}>
    
    {/* ATTEMPT HEADER */}
    <Text style={styles.cardTitle}>
      Attempt {attempt.attempt_number}
    </Text>

    {/* QUESTIONS INSIDE ATTEMPT */}
    {attempt.questions.map((q, index) => {

      const uniqueKey = `${attemptIndex}-${index}`;
      const isExpanded = expandedQuestions.includes(uniqueKey);

      return (
        <View key={uniqueKey} style={styles.questionCard}>

          {/* QUESTION HEADER */}
          <View style={styles.questionHeader}>
            <Text style={styles.questionTitle}>
              Question {index + 1}
            </Text>

            {q.video_url && (
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() =>{console.log(q.video_url);
                    navigation.navigate('VideoScreen', {
                      video_url: q.video_url!,
                    })
                  }}
                >
                  <Text style={styles.videoButtonText}>View Video</Text>
                </TouchableOpacity>
              )}

            {q.feedback && q.feedback.length > 0 && (
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => toggleQuestionDetails(uniqueKey)}
              >
                <Text style={styles.detailsButtonText}>
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SCORES */}
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text
              style={[
                styles.metricValue,
                { color: getScoreColor(q.confidence) },
              ]}
            >
              {q.confidence}%
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Knowledge</Text>
            <Text
              style={[
                styles.metricValue,
                { color: getScoreColor(q.knowledge * 100) },
              ]}
            >
              {(q.knowledge * 100).toFixed(1)}%
            </Text>
          </View>

          {/* EXPANDED FEEDBACK */}
          {isExpanded &&
            q.feedback &&
            Array.isArray(q.feedback) &&
            q.feedback.length > 0 && (
              <View style={styles.feedbackBox}>
                
                <Text style={styles.feedbackTitle}>
                  Detailed Feedback
                </Text>

                {/* HEADER */}
                <View style={styles.feedbackHeaderRow}>
                  <Text style={[styles.feedbackHeader, { flex: 3 }]}>
                    Feature
                  </Text>
                  <Text style={[styles.feedbackHeader, { flex: 2 }]}>
                    Your
                  </Text>
                  <Text style={[styles.feedbackHeader, { flex: 2 }]}>
                    Ideal
                  </Text>
                  <Text style={[styles.feedbackHeader, { flex: 2 }]}>
                    %
                  </Text>
                </View>

                {/* ROWS */}
                {q.feedback.map((f, i) => (
                  <View key={i} style={styles.feedbackRow}>
                    <Text style={[styles.feedbackCell, { flex: 3 }]}>
                      {f.feature}
                    </Text>
                    <Text style={[styles.feedbackCell, { flex: 2 }]}>
                      {f.your}
                    </Text>
                    <Text style={[styles.feedbackCell, { flex: 2 }]}>
                      {f.ideal}
                    </Text>
                    <View
                      style={{
                        flex: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getScoreColor(f.percentage) },
                        ]}
                      >
                        {f.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}

                {/* ADVICE */}
                <View style={styles.feedbackMessages}>
                  <Text style={styles.feedbackMessagesTitle}>
                    Advice:
                  </Text>

                  {q.feedback.map((f, i) => (
                    <View
                      key={i}
                      style={styles.feedbackMessageRow}
                    >
                      <Text style={styles.featureBullet}>•</Text>
                      <View style={styles.feedbackMessageContainer}>
                        <Text
                          style={[
                            styles.feedbackMessageText,
                            { color: getScoreColor(f.percentage) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.featureName,
                              { color: '#333' },
                            ]}
                          >
                            {f.feature}:{' '}
                          </Text>
                          {f.feedback}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

              </View>
          )}
        </View>
      );
    })}
  </View>
))}


        
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f4f6f8' 
  },
  content: { 
    padding: 16 
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingSub: { 
    fontSize: 13, 
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  header: { 
    marginBottom: 20 
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: 'bold',
    color: '#111',
  },
  headerSub: { 
    fontSize: 14, 
    color: '#666',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 12,
    color: '#222',
  },

  overallRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  scoreBox: { 
    alignItems: 'center', 
    flex: 1 
  },
  scoreLabel: { 
    fontSize: 14, 
    color: '#666' 
  },
  scoreValue: { 
    fontSize: 28, 
    fontWeight: 'bold' 
  },

  questionCard: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionTitle: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#333',
  },

  detailsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: { 
    fontSize: 14, 
    color: '#555' 
  },
  metricValue: { 
    fontSize: 14, 
    fontWeight: '600' 
  },

  feedbackBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  feedbackTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8,
    color: '#333',
  },

  feedbackHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  feedbackHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  feedbackRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  feedbackCell: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
    color: '#444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    paddingHorizontal: 4,
  },

  feedbackMessages: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  feedbackMessagesTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  feedbackMessageRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  featureBullet: {
    fontSize: 12,
    marginRight: 6,
    color: '#666',
    marginTop: 2,
  },
  feedbackMessageContainer: {
    flex: 1,
  },
  feedbackMessageText: {
    fontSize: 12,
    lineHeight: 16,
  },
  featureName: {
    fontWeight: '600',
  },

  infoText: { 
    fontSize: 14, 
    marginBottom: 6,
    color: '#555',
  },

  retakeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  retakeText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },videoButton: {
  backgroundColor: '#34C759',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
},

videoButtonText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
},
});
