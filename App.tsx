import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Screen1 from './Screens/Screen1';
import Screen2 from './Screens/Screen2';
import Screen3 from './Screens/Screen3';
import Screen5 from './Screens/Screen5';
import Screen6 from './Screens/Screen6';
import Screen7 from './Screens/Screen7';
import UserInterviewHistoryScreen from './Screens/UserInterviewHistoryScreen';
import FieldDetailScreen from './Screens/FieldDetailScreen';
import QuestionListScreen from './Screens/QuestionListScreen';
import AddQuestionScreen from './Screens/AddQuestionScreen';
import AddFieldScreen from './Screens/AddFieldScreen';
import Screen10 from './Screens/Screen10';
import Screen11 from './Screens/Screen11';
import ResultScreen from './Screens/ResultScreen';
import UserDetailScreen from './Screens/UserDetailScreen';
import AnswerListScreen from './Screens/AnswerListScreen';
import AddAnswerScreen from './Screens/AddAnswerScreen';
import EditAnswerScreen from './Screens/EditAnswerScreen';
import UserDashboard from './Screens/UserDashboard';
import HistoryInHistory from "./Screens/HistoryInHistory";
import VideoScreen from './Screens/VideoScreen';


export type RootStackParamList = {
  Screen1: undefined;
  Screen2: undefined;
  UserDashboard:{userName:string; userId:number}
  Screen3: { userName: string; userId: number };
  Screen5: { userName: string; userId: number };
  Screen6: undefined;
  Screen7: undefined;
  UserDetailScreen: { userId: number };
  UserInterviewHistoryScreen: { userId: number };
  FieldDetailScreen: { fieldId: number };
  QuestionListScreen: { fieldId: number };
  AddQuestionScreen: { fieldId: number };
  AddFieldScreen: undefined;
  AnswerListScreen:{questionId:number}
  EditAnswerScreen:{answerId:number,answerText:string}
  AddAnswerScreen:{questionId:number}
  HistoryInHistory:{interview_id:number}

  Screen10: { 
    userName: string; 
    userId: number;       // <-- add this
    field_id: number; 
    interview_id: number; 
    level:string;
  };
  Screen11: { user_id: number; userName: string };
  ResultScreen:{
  userName: string; 
  userId: number; 
  field_id: number; 
  interview_id: number;
  level:string 
};
VideoScreen:{video_url: string;};

  Start: undefined;
};



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Screen1">
        <Stack.Screen name="Screen1" component={Screen1} options={{ title: 'Login' }} />
        <Stack.Screen name="Screen2" component={Screen2} options={{ title: 'Sign Up' }} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} options={{ title: 'Sign Up' }} />

        <Stack.Screen name="Screen3" component={Screen3} options={{ title: 'Select Field' }} />
        <Stack.Screen name="Screen5" component={Screen5} options={{ title: 'Admin Controls' }} />
        <Stack.Screen name="Screen6" component={Screen6} options={{ title: 'Admin Controls Users' }} />
        <Stack.Screen name="Screen7" component={Screen7} options={{ title: 'Admin Controls Fields' }} />
        <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} options={{ title: 'admin user detail' }} />
        <Stack.Screen name="UserInterviewHistoryScreen" component={UserInterviewHistoryScreen} options={{ title: 'admin user interview ' }} />
        <Stack.Screen name="FieldDetailScreen" component={FieldDetailScreen} options={{ title: 'admin see feilds' }} />
        <Stack.Screen name="QuestionListScreen" component={QuestionListScreen} options={{ title: 'admin see questions' }} />
        <Stack.Screen name="AddQuestionScreen" component={AddQuestionScreen} options={{ title: 'admin add questions' }} />
        <Stack.Screen name="AddFieldScreen" component={AddFieldScreen} options={{ title: 'admin add field' }} />
        <Stack.Screen name="AnswerListScreen" component={AnswerListScreen} options={{ title: 'show answer' }} />
        <Stack.Screen name="AddAnswerScreen" component={AddAnswerScreen} options={{ title: 'Add Answer' }} />
        <Stack.Screen name="EditAnswerScreen" component={EditAnswerScreen} options={{ title: 'Edit Answer' }} />
        <Stack.Screen name="Screen10" component={Screen10} options={{ title: 'User Answer in Video' }} />
        <Stack.Screen name="Screen11" component={Screen11} options={{ title: 'History' }} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ title: 'Result' }} />
        <Stack.Screen name="HistoryInHistory" component={HistoryInHistory} options={{ title: 'HistoryInHistory' }} />
         <Stack.Screen name="VideoScreen" component={VideoScreen} options={{ title: 'UserVideo' }} />


        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
