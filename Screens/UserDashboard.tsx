import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../App';
import config from '../config';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserDashboard'>;
  route: { params: { userName: string; userId: number } };
};

export default function UserDashboard({ navigation, route }: Props) {
  const { userName, userId } = route.params;

  return (<ScrollView contentContainerStyle={styles.container}>
       <Text style={styles.title}>Welcome, {userName} 👋</Text>
      
       {/* Action Buttons */}
       <TouchableOpacity
         style={styles.button}
         onPress={() => navigation.navigate('Screen3', { userName, userId })}
       >
         <Text style={styles.buttonText}>Start New Interview</Text>
       </TouchableOpacity>

       <TouchableOpacity
         style={[styles.button, styles.historyButton]}
         onPress={() => navigation.navigate('Screen11', { userName, user_id: userId })}
       >
         <Text style={styles.buttonText}>View Detailed History</Text>
       </TouchableOpacity></ScrollView>);

}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  
  // Chart Styles
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartDotText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  
  // Progress Ring Styles
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringBackground: {
    position: 'absolute',
    borderWidth: 8,
  },
  ringProgress: {
    position: 'absolute',
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  ringLabel: {
    marginTop: 4,
    color: '#666',
  },
  
  // Averages Section
  averagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  averageCard: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
  },
  averageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  averageLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Trend Analysis Styles
  trendContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#666',
  },
  trendValueContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Button Styles
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  historyButton: { 
    backgroundColor: '#28A745',
    shadowColor: '#28A745',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  improvementItem: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  improvementText: {
    color: '#856404',
    fontWeight: '600',
  },
});