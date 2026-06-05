import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

import Video from 'react-native-video';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  VideoScreen: {
    video_url: string;
  };
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  'VideoScreen'
>;

export default function VideoScreen({ route }: Props) {

  const { video_url } = route.params;

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: video_url }}
        style={styles.video}
        controls
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  video: {
    width: '100%',
    height: '100%',
  },
});