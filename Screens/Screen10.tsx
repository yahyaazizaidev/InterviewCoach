// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import {
//   Camera,
//   useCameraDevices,
//   useCameraPermission,
//   useMicrophonePermission,
// } from "react-native-vision-camera";
// import { Video } from 'react-native-compressor';
// import config from '../config';
// import { useIsFocused } from '@react-navigation/native';
// type Screen10Props = {
//   route: {
//     params: {
//       userName: string;
//       userId: number;
//       field_id: number;
//       interview_id: number;
//       level:string;
//     };
//   };
//   navigation: any;
// };

// export default function Screen10({ route, navigation }: Screen10Props) {
//   const isFocused = useIsFocused();

//   useEffect(() => {
//   if (isFocused) {
//     // reset all recording-related states
//     setVideoPath(null);
//     setIndex(0);
//     setIsRecording(false);
//     setProcessing(false);
//   }
// }, [isFocused]);
//   const { userName, userId, field_id, interview_id,level } = route.params;

//   const { hasPermission: camPerm, requestPermission: reqCam } = useCameraPermission();
//   const { hasPermission: micPerm, requestPermission: reqMic } = useMicrophonePermission();

//   const devices = useCameraDevices();
//   const device = devices.find((d) => d.position === "front");
//   const cameraRef = useRef<Camera>(null);

//   const [questions, setQuestions] = useState<any[]>([]);
//   const [index, setIndex] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
//   const [videoPath, setVideoPath] = useState<string | null>(null);
//   const [processing, setProcessing] = useState(false);
//   const [loadingQuestions, setLoadingQuestions] = useState(true);

//   // ------------------- Fetch Questions -------------------
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         await fetch(`${config.API_BASE_URL}/reset_overall_confidence`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           interview_id: interview_id, // must exist
//         }),
//       });
//         const res = await fetch(`${config.API_BASE_URL}/get_questions/${field_id}?level=${level}`);
//         const data = await res.json();
//         setQuestions(data.questions || []);
//       } catch (error: any) {
//         Alert.alert("Error loading questions", error.message || JSON.stringify(error));
//       } finally {
//         setLoadingQuestions(false);
//       }
//     };

//     fetchQuestions();
//   }, []);

//   // ------------------- Request Permissions -------------------
//   useEffect(() => {
//     (async () => {
//       if (!camPerm) await reqCam();
//       if (!micPerm) await reqMic();
//       if (Platform.OS === 'android') await requestStoragePermission();
//     })();
//   }, []);

//   // ------------------- Request Android Storage Permission -------------------
//  const requestStoragePermission = async () => {
//   if (Platform.OS !== 'android') return true;

//   try {
//     if (Platform.Version >= 33) {
//       const result = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
//       );
//       return result === PermissionsAndroid.RESULTS.GRANTED;
//     }

//     const result = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
//     );

//     return result === PermissionsAndroid.RESULTS.GRANTED;
//   } catch (e) {
//     console.log(e);
//     return false;
//   }
// };

//   // ------------------- Start Recording -------------------
//   const startRecording = async () => {
//     if (!cameraRef.current) return;

//     try {
//       setIsRecording(true);
//       setVideoPath(null);
      

//       cameraRef.current.startRecording({
//         onRecordingFinished: (video) => {
//           setVideoPath(video.path);
//           setIsRecording(false);
//         },
//         onRecordingError: (err) => {
//           setIsRecording(false);
//           Alert.alert("Recording Error", "Could not record video");
//         },
//       });
//     } catch (err) {
//       Alert.alert("Error", "Could not start recording");
//     }
//   };

//   // ------------------- Stop Recording -------------------
//   const stopRecording = async () => {
//     if (!cameraRef.current) return;
//     try {
//       await cameraRef.current.stopRecording();
//     } catch (err) {
//       console.log("Stop error:", err);
//     }
//   };
//   //--------------------------------------
//   // ADD THIS FUNCTION (keep it above processAndSaveVideo)
// // const uploadVideo = async (filePath: string) => {
// //   try {
// //     console.log("1");
// //     const formData = new FormData();
// //     console.log("1");
// //     formData.append('video', {
// //       uri: filePath.startsWith('file://')
// //   ? filePath
// //   : `file://${filePath}`,
// //       type: 'video/mp4',
// //       name: `video_${Date.now()}.mp4`,
// //     } as any);
// //     console.log("1");
// //     formData.append('interview_id', interview_id.toString());
// //     formData.append('question_id', questions[index]?.question_id.toString());
// //     console.log("1");
// //     const response = await fetch(`${config.API_BASE_URL}/upload-video`, {
// //   method: 'POST',
// //   body: formData,
// // }
// // );console.log("1");


// //     const result = await response.json();console.log("1");
// //     return result;

// //   } catch (error) {
// //     console.error('Upload error:', error);
// //     throw error;
// //   }
// // };

// const uploadVideo = async (filePath: string) => {
//   try {
//     console.log("start");

//     // STEP 1: COMPRESS FIRST
//     const compressedPath = await Video.compress(filePath, {
//       compressionMethod: 'auto',
//     });

//     console.log("compressed:", compressedPath);

//     // STEP 2: USE COMPRESSED FILE
//     const formData = new FormData();

//     formData.append('video', {
//       uri: compressedPath.startsWith('file://')
//         ? compressedPath
//         : `file://${compressedPath}`,
//       type: 'video/mp4',
//       name: `video_${Date.now()}.mp4`,
//     } as any);

//     formData.append('interview_id', interview_id.toString());
//     formData.append('question_id', questions[index]?.question_id.toString());

//     // STEP 3: UPLOAD
//     const response = await fetch(`${config.API_BASE_URL}/upload-video`, {
//       method: 'POST',
//       body: formData,
//     });

//     const result = await response.json();
//     return result;

//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error;
//   }
// };
//   // ------------------- Process and Save Video -------------------
//   const processAndSaveVideo = async () => {
//   if (!videoPath) return;

//   setProcessing(true);

  
//   try {
//     // 🔥 Upload to server (MAIN FIX)
//     const result = await uploadVideo(videoPath);

//     if (!result.success) {
//       throw new Error("Upload failed");
//     }

//     console.log("Uploaded video:", result.path);

//     // Move forward
//     if (index < questions.length - 1) {
//       setIndex(index + 1);
//       setVideoPath(null);
//     } else {
//       navigation.replace('ResultScreen', {
//         interview_id,
//         userId,
//         userName,
//         field_id,
//         level
//       });
//     }

//   } catch (error: any) {
//     console.error("Processing error:", error);
//     Alert.alert("Error", error.message || "Upload failed");
//   } finally {
//     setProcessing(false);
//   }
// };

//   // ------------------- Handle Button Press -------------------
//   const handlePress = async () => {
//     if (!isRecording && !videoPath) {
//       await startRecording();
//     } else if (isRecording) {
//       await stopRecording();
//     } else if (videoPath) {
//       await processAndSaveVideo();
//     }
//   };

//   // ------------------- Button Text -------------------
//   const getButtonText = () => {
//     if (isRecording) return "⏹ Stop Recording";
//     if (processing) return "🔄 Processing...";
//     if (videoPath) return "💾 Save & Next";
//     return "🎬 Start Answer";
//   };

//   if (!device || loadingQuestions)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={{ marginTop: 10 }}>Loading camera and questions...</Text>
//       </View>
//     );

//   // ------------------- Render -------------------
//   return (
//     <View style={styles.container}>
//       {/* Camera */}
//       <View style={styles.cameraBox}>
//         <Camera
//           ref={cameraRef}
//           style={StyleSheet.absoluteFill}
//           device={device}
//           isActive={true}
//           video={true}
//           audio={true}
//         />

//         {isRecording && (
//           <View style={styles.recordingBadge}>
//             <View style={styles.recordingDot} />
//             <Text style={styles.recordText}>RECORDING</Text>
//           </View>
//         )}
//       </View>

//       {/* Question Area */}
//       <ScrollView style={styles.bottom}>
//         <Text style={styles.qNumber}>
//           Question {index + 1} of {questions.length}
//         </Text>
//         <Text style={styles.qText}>
//           {questions[index]?.question_text || "Loading question..."}
//         </Text>
        
//         <View style={styles.statusContainer}>
//           {videoPath && (
//             <View style={styles.statusBox}>
//               <Text style={styles.statusTitle}>📱 Video ready</Text>
//               <Text style={styles.statusText}>Tap "Save & Next" to process</Text>
//             </View>
//           )}
//         </View>

//         {/* Action Button */}
//         <TouchableOpacity
//           style={[
//             styles.button,
//             isRecording && styles.recordingButton,
//             processing && styles.processingButton,
//           ]}
//           onPress={handlePress}
//           disabled={processing}
//         >
//           {processing ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <Text style={styles.btnText}>{getButtonText()}</Text>
//           )}
//         </TouchableOpacity>
        
//         {/* Progress */}
//         <View style={styles.progressContainer}>
//           <View style={[
//             styles.progressBar, 
//             { width: `${((index + (videoPath ? 0.5 : 0)) / questions.length) * 100}%` }
//           ]} />
//           <Text style={styles.progressText}>
//             {index} of {questions.length} completed
//           </Text>
//         </View>
        
//         <View style={styles.infoContainer}>
//           <Text style={styles.infoText}>Questions: {questions.length}</Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "black" },
//   cameraBox: { 
//     flex: 1, 
//     backgroundColor: "#222",
//     overflow: 'hidden',
//     margin: 10,
//     borderRadius: 15,
//   },
//   recordingBadge: {
//     position: "absolute",
//     top: 20,
//     alignSelf: "center",
//     flexDirection: "row",
//     backgroundColor: "rgba(255, 59, 48, 0.9)",
//     padding: 10,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     alignItems: "center",
//   },
//   recordingDot: { 
//     width: 12, 
//     height: 12, 
//     borderRadius: 6, 
//     backgroundColor: "white",
//     marginRight: 8,
//   },
//   recordText: { 
//     color: "white", 
//     fontWeight: "bold",
//     fontSize: 14,
//   },
//   bottom: {
//     backgroundColor: "white",
//     padding: 25,
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//     maxHeight: 350,
//   },
//   qNumber: { 
//     fontSize: 16, 
//     color: "#666", 
//     marginBottom: 8,
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   qText: { 
//     fontSize: 22, 
//     fontWeight: "700", 
//     textAlign: "center",
//     marginBottom: 25,
//     color: '#222',
//     lineHeight: 28,
//   },
//   statusContainer: {
//     marginBottom: 20,
//   },
//   statusBox: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   statusTitle: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//     flex: 1,
//   },
//   statusText: {
//     fontSize: 14,
//     color: '#6C757D',
//   },
//   button: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 18,
//     borderRadius: 30,
//     marginTop: 5,
//     alignItems: "center",
//     elevation: 4,
//     shadowColor: '#007AFF',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   recordingButton: {
//     backgroundColor: "#FF3B30",
//     shadowColor: '#FF3B30',
//   },
//   processingButton: {
//     backgroundColor: "#FF9500",
//     shadowColor: '#FF9500',
//   },
//   btnText: { 
//     color: "white", 
//     fontSize: 19, 
//     fontWeight: "bold",
//     letterSpacing: 0.5,
//   },
//   center: { 
//     flex: 1, 
//     justifyContent: "center", 
//     alignItems: "center",
//     backgroundColor: '#fff',
//   },
//   progressContainer: {
//     marginTop: 25,
//     height: 8,
//     backgroundColor: '#E9ECEF',
//     borderRadius: 4,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#34C759',
//     borderRadius: 4,
//   },
//   progressText: {
//     textAlign: 'center',
//     marginTop: 12,
//     fontSize: 13,
//     color: '#6C757D',
//     fontWeight: '500',
//   },
//   infoContainer: {
//     marginTop: 15,
//     padding: 10,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   infoText: {
//     fontSize: 12,
//     color: '#6C757D',
//     marginBottom: 2,
//   },
// });


import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from "react-native";
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
import { Video } from 'react-native-compressor';
import config from '../config';
import { useIsFocused } from '@react-navigation/native';
type Screen10Props = {
  route: {
    params: {
      userName: string;
      userId: number;
      field_id: number;
      interview_id: number;
      level:string;
    };
  };
  navigation: any;
};
type UploadItem = {
  path: string;
  question_id: number;
};

export default function Screen10({ route, navigation }: Screen10Props) {
  const uploadQueue = useRef<UploadItem[]>([]);
  const isUploading = useRef(false);
  const isFocused = useIsFocused();
  const hasStartedProcessing = useRef(false);
  const hasMarkedComplete = useRef(false);

  useEffect(() => {
  if (isFocused) {
    // reset all recording-related states
    setVideoPath(null);
    setIndex(0);
    setIsRecording(false);
    setProcessing(false);
  }
}, [isFocused]);
  const { userName, userId, field_id, interview_id,level } = route.params;

  const { hasPermission: camPerm, requestPermission: reqCam } = useCameraPermission();
  const { hasPermission: micPerm, requestPermission: reqMic } = useMicrophonePermission();

  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === "front");
  const cameraRef = useRef<Camera>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [finishingInterview, setFinishingInterview] = useState(false);
  const [featureSummary, setFeatureSummary] = useState<any>(null);

useEffect(() => {
  const fetchFeatureSummary = async () => {
    try {
      const res = await fetch(
        `${config.API_BASE_URL}/get_feature_summary/${interview_id}`
      );

      const data = await res.json();

      if (data.status === "success") {
        setFeatureSummary(data.feature_summary|| {});
      }
    } catch (e) {
      console.log("feature summary error:", e);
    }
  };

  fetchFeatureSummary();
}, []);

const hiddenFeatures = [
  "head_movement_avg",
  "pitch_mean",
  "dominant_emotion",
];

const weakFeatures = Object.entries(featureSummary || {})
  .filter(
    ([key, value]) =>
      value === "weak" &&
      !hiddenFeatures.includes(key)
  )
  .map(([key]) => key);


const coachingTips: Record<string, string> = {
  speech_rate: "Speak a bit slower for clarity",
  confidence: "Maintain stronger confidence in your tone",
  eye_contact: "Try to maintain steady eye contact",
  facial_expression: "Be more expressive while speaking",
  audio_emotion:"",
};

  const processUploadQueue = async () => {
  if (isUploading.current) return;

  isUploading.current = true;

  while (uploadQueue.current.length > 0) {
    const item = uploadQueue.current.shift();

    if (!item) continue;

    try {
      await uploadVideo(item.path, item.question_id);
      console.log("Uploaded:", item.question_id);
    } catch (e) {
      console.log("Upload failed:", e);
    }
  }

  isUploading.current = false;
};

  // ------------------- Fetch Questions -------------------
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        await fetch(`${config.API_BASE_URL}/reset_overall_confidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interview_id: interview_id, // must exist
        }),
      });
        // const res = await fetch(`${config.API_BASE_URL}/get_questions/${field_id}?level=${level}`);
       const res = await fetch(
  `${config.API_BASE_URL}/get_questions/${field_id}?interview_id=${interview_id}&level=${level}`
);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (error: any) {
        Alert.alert("Error loading questions", error.message || JSON.stringify(error));
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  // ------------------- Request Permissions -------------------
  useEffect(() => {
    (async () => {
      if (!camPerm) await reqCam();
      if (!micPerm) await reqMic();
      if (Platform.OS === 'android') await requestStoragePermission();
    })();
  }, []);

  // ------------------- Request Android Storage Permission -------------------
 const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    console.log(e);
    return false;
  }
};

  // ------------------- Start Recording -------------------
  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setVideoPath(null);
      

      cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          setVideoPath(video.path);
          setIsRecording(false);
        },
        onRecordingError: (err) => {
          setIsRecording(false);
          Alert.alert("Recording Error", "Could not record video");
        },
      });
    } catch (err) {
      Alert.alert("Error", "Could not start recording");
    }
  };

  // ------------------- Stop Recording -------------------
  const stopRecording = async () => {
    if (!cameraRef.current) return;
    try {
      await cameraRef.current.stopRecording();
    } catch (err) {
      console.log("Stop error:", err);
    }
  };
  //--------------------------------------
  // ADD THIS FUNCTION (keep it above processAndSaveVideo)
// const uploadVideo = async (filePath: string) => {
//   try {
//     console.log("1");
//     const formData = new FormData();
//     console.log("1");
//     formData.append('video', {
//       uri: filePath.startsWith('file://')
//   ? filePath
//   : `file://${filePath}`,
//       type: 'video/mp4',
//       name: `video_${Date.now()}.mp4`,
//     } as any);
//     console.log("1");
//     formData.append('interview_id', interview_id.toString());
//     formData.append('question_id', questions[index]?.question_id.toString());
//     console.log("1");
//     const response = await fetch(`${config.API_BASE_URL}/upload-video`, {
//   method: 'POST',
//   body: formData,
// }
// );console.log("1");


//     const result = await response.json();console.log("1");
//     return result;

//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error;
//   }
// };

const uploadVideo = async (
  filePath: string,
  questionId: number
) => {
  try {
    console.log("start upload");

  const compressedPath = await Video.compress(
  filePath,
  {
    compressionMethod: 'manual',
    maxSize: 480,
    bitrate: 800000,
  }
);

    const formData = new FormData();

    formData.append('video', {
      uri: compressedPath.startsWith('file://')
        ? compressedPath
        : `file://${compressedPath}`,
      type: 'video/mp4',
      name: `video_${Date.now()}.mp4`,
    } as any);

    formData.append(
      'interview_id',
      interview_id.toString()
    );

    formData.append(
      'question_id',
      questionId.toString()
    );

    const response = await fetch(
      `${config.API_BASE_URL}/upload-video`,
      {
        method: 'POST',
        body: formData,
      }
    );

    return await response.json();

  } catch (error) {
    console.log(error);
    throw error;
  }
};
  // ------------------- Process and Save Video -------------------
// const processAndSaveVideo = async () => {
//   if (!videoPath) return;

//   try {
//     const currentQuestionId =
//       questions[index]?.question_id;

//     // ADD TO QUEUE
//     uploadQueue.current.push({
//       path: videoPath,
//       question_id: currentQuestionId,
//     });

//     // START BACKGROUND UPLOAD
//     processUploadQueue();

//     // MOVE IMMEDIATELY TO NEXT QUESTION
//     if (index < questions.length - 1) {
//       setIndex(prev => prev + 1);
//       setVideoPath(null);
//     } else {

//       // WAIT FOR ALL UPLOADS BEFORE RESULT SCREEN
//       const waitForUploads = setInterval(() => {
//         if (
//           uploadQueue.current.length === 0 &&
//           !isUploading.current
//         ) {
//           clearInterval(waitForUploads);

//           navigation.replace('ResultScreen', {
//             interview_id,
//             userId,
//             userName,
//             field_id,
//             level,
//           });
//         }
//       }, 1000);
//     }

//   } catch (error: any) {
//     console.log(error);
//     Alert.alert("Error", "Failed");
//   }
// };
const processAndSaveVideo = async () => {
  if (!videoPath) return;

  try {
    const currentQuestionId =
      questions[index]?.question_id;

    // ADD TO QUEUE
    uploadQueue.current.push({
      path: videoPath,
      question_id: currentQuestionId,
    });

    // START BACKGROUND UPLOAD
    processUploadQueue();

    // MOVE IMMEDIATELY TO NEXT QUESTION
    if (index < questions.length - 1) {
      setIndex(prev => prev + 1);
      setVideoPath(null);
    } else {

      // LAST QUESTION
      setFinishingInterview(true);
      setVideoPath(null);

      // WAIT FOR ALL UPLOADS
      const waitForUploads = setInterval(() => {
        if (
          uploadQueue.current.length === 0 &&
          !isUploading.current
        ) {
          clearInterval(waitForUploads);

          navigation.replace('ResultScreen', {
            interview_id,
            userId,
            userName,
            field_id,
            level,
          });
        }
      }, 1000);
    }

  } catch (error: any) {
    console.log(error);
    Alert.alert("Error", "Failed");
  }
};

  // ------------------- Handle Button Press -------------------
  const handlePress = async () => {
    if (!isRecording && !videoPath) {
      await startRecording();
    } else if (isRecording) {
      await stopRecording();
    } else if (videoPath) {
      await processAndSaveVideo();
    }
  };

  // ------------------- Button Text -------------------
  // const getButtonText = () => {
  //   if (isRecording) return "⏹ Stop Recording";
  //   if (processing) return "🔄 Processing...";
  //   if (videoPath) return "💾 Save & Next";
  //   return "🎬 Start Answer";
  // };
  const getButtonText = () => {

  if (finishingInterview)
    return "📤 Uploading Videos...";

  if (isRecording)
    return "⏹ Stop Recording";

  if (videoPath) {

    if (index === questions.length - 1)
      return "✅ Finish Interview";

    return "➡ Save & Next";
  }

  return "🎬 Start Answer";
};

  if (!device || loadingQuestions)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading camera and questions...</Text>
      </View>
    );

  // ------------------- Render -------------------
  return (
    <View style={styles.container}>
      {/* Camera */}
      <View style={styles.cameraBox}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          video={true}
          audio={true}
        />

        {isRecording && (
          <View style={styles.recordingBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordText}>RECORDING</Text>
          </View>
        )}
      </View>

      {/* Question Area */}
      <ScrollView style={styles.bottom}>
        {/* {weakFeatures.length > 0 && (
  <View style={styles.coachingBox}>
    <Text style={styles.coachingTitle}>Coaching Tips</Text>

    {weakFeatures.map((feature) => (
      <Text key={feature} style={styles.coachingText}>
        • {coachingTips[feature] || feature}
      </Text>
    ))}
  </View>
)} */}


        <Text style={styles.qNumber}>
          Question {index + 1} of {questions.length}
        </Text>
        <Text style={styles.qText}>
          {questions[index]?.question_text || "Loading question..."}
        </Text>
        
        <View style={styles.statusContainer}>
          {videoPath && (
            <View style={styles.statusBox}>
              <Text style={styles.statusTitle}>📱 Video ready</Text>
              <Text style={styles.statusText}>Tap "Save & Next" to process</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.button,
            isRecording && styles.recordingButton,
            processing && styles.processingButton,
          ]}
          onPress={handlePress}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>
        
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={[
            styles.progressBar, 
            { width: `${((index + (videoPath ? 0.5 : 0)) / questions.length) * 100}%` }
          ]} />
          <Text style={styles.progressText}>
            {index} of {questions.length} completed
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Questions: {questions.length}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  cameraBox: { 
    flex: 1, 
    backgroundColor: "#222",
    overflow: 'hidden',
    margin: 10,
    borderRadius: 15,
  },
  recordingBadge: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
  },
  recordingDot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: "white",
    marginRight: 8,
  },
  recordText: { 
    color: "white", 
    fontWeight: "bold",
    fontSize: 14,
  },
  bottom: {
    backgroundColor: "white",
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: 350,
  },
  qNumber: { 
    fontSize: 16, 
    color: "#666", 
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  qText: { 
    fontSize: 22, 
    fontWeight: "700", 
    textAlign: "center",
    marginBottom: 25,
    color: '#222',
    lineHeight: 28,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusBox: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    color: '#6C757D',
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 5,
    alignItems: "center",
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
    shadowColor: '#FF3B30',
  },
  processingButton: {
    backgroundColor: "#FF9500",
    shadowColor: '#FF9500',
  },
  btnText: { 
    color: "white", 
    fontSize: 19, 
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#fff',
  },
  progressContainer: {
    marginTop: 25,
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  infoContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },coachingBox: {
  backgroundColor: "#FFF3CD",
  padding: 12,
  borderRadius: 10,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: "#FFE69C",
},

coachingTitle: {
  fontSize: 14,
  fontWeight: "bold",
  marginBottom: 6,
  color: "#856404",
},

coachingText: {
  fontSize: 13,
  color: "#856404",
  marginBottom: 3,
},
});
