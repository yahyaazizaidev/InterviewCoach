import React, { useEffect, useState } from 'react';
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
  ResultScreen: {
    interview_id: number;
    userId: number;
    userName: string;
    field_id: number;
    level: string;
  };
  Screen3: {
    userName: string;
    userId: number;
  };
  UserDashboard: {
    userName: string;
    userId: number;
  };
  Screen10: { interview_id: number; userId: number; userName: string; field_id: number; level: string };

  VideoScreen: {
    video_url: string;
  };
};

type FeedbackType = {
  feature: string;      // "Eye Contact", "Head Movement", etc.
  your: string | number; // the value you measured
  ideal: string | number; // the ideal/benchmark value
  percentage: number;     // percentage score instead of status
  feedback: string;       // the advice message
};

type ScoreType = {
  question_id: number;
  confidence: number;
  knowledge: number;
  video_url?: string;
  feedback?: FeedbackType[];
};

type OverallResultType = {
  overall_confidence: number;
  overall_knowledge: number;
  individual_scores: ScoreType[];
};

type ResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ResultScreen'
>;

const getScoreColor = (score: number) => {
  if (score >= 70) return '#34C759';
  if (score >= 50) return '#FF9500';
  return '#FF3B30';
};

// New function to color percentages
const getPercentageColor = (percentage: number) => {
  if (percentage >= 90) return '#34C759'; // green
  if (percentage >= 60) return '#FF9500'; // orange
  return '#FF3B30'; // red
};

export default function ResultScreen({ route, navigation }: ResultScreenProps) {
  const { interview_id, userId, userName, level, field_id } = route.params;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Starting analysis...');
  const [results, setResults] = useState<OverallResultType>({
    overall_confidence: 0,
    overall_knowledge: 0,
    individual_scores: [],
  });
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [allFeaturesGood, setAllFeaturesGood] = useState(false);
  const [weakFeatures, setWeakFeatures] = useState<string[]>([]);

  useEffect(() => {
    startProcessing();
    const cleanup = pollResults();
    return cleanup;
  }, []);

  const toggleQuestionDetails = (index: number) => {
    if (expandedQuestions.includes(index)) {
      setExpandedQuestions(expandedQuestions.filter(i => i !== index));
    } else {
      setExpandedQuestions([...expandedQuestions, index]);
    }
  };

  const startProcessing = async () => {
    try {
      await fetch(`${config.API_BASE_URL}/run_test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_id }),
      });
    } catch {
      setStatus('Checking saved results...');
    }
  };

  const pollResults = () => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${config.API_BASE_URL}/get_overall_confidence/${interview_id}`
        );
        const data = await res.json();

        if (data.success) {
         
          const individual_scores = (data.individual_scores || []).map((q: any) => ({
            ...q,
            feedback: q.feedback ? JSON.parse(q.feedback) : [],
          }));

          setResults({
            overall_confidence: data.overall_confidence,
            overall_knowledge: data.overall_knowledge,
            individual_scores: individual_scores,
          });console.log(JSON.stringify(data, null, 2));
          setLoading(false);
          clearInterval(interval);
        } else {
          setStatus(data.message || 'Processing...');
        }
      } catch {
        setStatus('Waiting for server...');
      }
    }, 20000);

    return () => clearInterval(interval);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{status}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Interview Results</Text>
        <Text style={styles.headerSub}>Interview ID: {interview_id}</Text>
        <Text></Text>
      </View>

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
                { color: getScoreColor(results.overall_knowledge) },
              ]}
            >
              {(results.overall_knowledge * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Question-wise Analysis</Text>

        {results.individual_scores.map((q, index) => (
          <View key={index} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>Question {index + 1}</Text>
              

              <View style={styles.buttonGroup}>

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
      onPress={() => toggleQuestionDetails(index)}
    >
      <Text style={styles.detailsButtonText}>
        {expandedQuestions.includes(index)
          ? 'Hide Details'
          : 'Show Details'}
      </Text>
    </TouchableOpacity>
  )}

</View>
            </View>

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
                  { color: getScoreColor(q.knowledge) },
                ]}
              >
                {(q.knowledge * 100).toFixed(1)}%
              </Text>
            </View>

            {expandedQuestions.includes(index) && q.feedback && Array.isArray(q.feedback) && q.feedback.length > 0 && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackTitle}>Detailed Feedback</Text>

                <View style={styles.feedbackHeaderRow}>
                  <Text style={[styles.feedbackHeader, { flex: 3 }]}>Feature</Text>
                  <Text style={[styles.feedbackHeader, { flex: 2 }]}>Your</Text>
                  <Text style={[styles.feedbackHeader, { flex: 2 }]}>Ideal</Text>
                  <Text style={[styles.feedbackHeader, { flex: 2 }]}>Percentage</Text>
                </View>

                {q.feedback.map((f, i) => (
                  <View key={i} style={styles.feedbackRow}>
                    <Text style={[styles.feedbackCell, { flex: 3 }]}>{f.feature}</Text>
                    <Text style={[styles.feedbackCell, { flex: 2 }]}>{f.your}</Text>
                    <Text style={[styles.feedbackCell, { flex: 2 }]}>{f.ideal}</Text>
                    <Text style={[
                      styles.feedbackCell,
                      { flex: 2, color: getPercentageColor(f.percentage) }
                    ]}>
                      {f.percentage}%
                    </Text>
                  </View>
                ))}

                <View style={styles.feedbackMessages}>
                  <Text style={styles.feedbackMessagesTitle}>Advice:</Text>
                  {q.feedback.map((f, i) => (
                    <View key={i} style={styles.feedbackMessageRow}>
                      <Text style={styles.featureBullet}>•</Text>
                      <View style={styles.feedbackMessageContainer}>
                        <Text style={[
                          styles.feedbackMessageText,
                          { color: getPercentageColor(f.percentage) }
                        ]}>
                          <Text style={styles.featureName}>{f.feature} ({f.percentage}%): </Text>
                          {f.feedback}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.retakeButton}
        onPress={() => navigation.replace('Screen10', {
          userName: userName,
          userId: userId,
          field_id: field_id,
          interview_id: interview_id,
          level: level,
        })}
      >
        <Text style={styles.retakeText}>Retake Interview</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() =>
          navigation.replace('UserDashboard', {
            userId,
            userName,
          })
        }
      >
        <Text style={styles.homeText}> Home</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
  disabled={!allFeaturesGood}
  style={[
    styles.homeButton,
    !allFeaturesGood && styles.disabledButton
  ]}
  onPress={() =>
    navigation.replace('UserDashboard', {
      userId,
      userName,
    })
  }
>
  <Text style={styles.homeText}>
    {allFeaturesGood
      ? 'Home'
      : 'Complete Weak Features First'}
  </Text>
</TouchableOpacity> */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  homeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  container: { flex: 1, backgroundColor: '#f4f6f8' },
  content: { padding: 16 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: { marginTop: 16, fontSize: 16 },
  loadingSub: { fontSize: 13, color: '#666' },

  header: { marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  headerSub: { fontSize: 14, color: '#666' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },

  overallRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreBox: { alignItems: 'center', flex: 1 },
  scoreLabel: { fontSize: 14, color: '#666' },
  scoreValue: { fontSize: 28, fontWeight: 'bold' },

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
  questionTitle: { fontSize: 16, fontWeight: '600' },

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
  metricLabel: { fontSize: 14, color: '#555' },
  metricValue: { fontSize: 14, fontWeight: '600' },

  feedbackBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  feedbackTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },

  feedbackHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 6,
  },
  feedbackHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },

  feedbackRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  feedbackCell: {
    fontSize: 12,
    textAlign: 'center',
  },

  feedbackMessages: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  feedbackMessagesTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  feedbackMessageRow: {
    flexDirection: 'row',
    marginBottom: 6,
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
    color: '#333',
  },

  infoText: { fontSize: 14, marginBottom: 4 },

  retakeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  retakeText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonGroup: {
  flexDirection: 'row',
  gap: 8,
},

videoButton: {
  backgroundColor: '#34C759',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
},

videoButtonText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
},disabledButton: {
  backgroundColor: '#999',
},
});
