import { StatusBar } from 'expo-status-bar';
import React , {useState, useEffect} from 'react';
import { Alert, Button, Text, TouchableOpacity, TextInput, View, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';

export default function App() {

  const [isFetching, setIsFetching ] = useState(false);
  const [email, setEmail] = useState('user');
  const [password, setPassword] = useState('password');

  const recordingSettings = {
    android: {
      extension: ".mp3",
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".mp3",
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };
  
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

const ENCODING = 'LINEAR16';
const SAMPLE_RATE_HERTZ = 41000;
const LANGUAGE = 'en-US';
  
  const startRecording = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    console.log(status);
    if (status !== 'granted'){
      throw new Error('Recording permission not granted');
      return;
    }
    // stop playback
    if (sound !== null) {
      await sound.unloadAsync();
      sound.setOnPlaybackStatusUpdate(null);
      setSound(null);
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const _recording = new Audio.Recording();
    try {
      await _recording.prepareToRecordAsync(recordingSettings);
      setRecording(_recording);
      await _recording.startAsync();
      console.log("recording");
      setIsRecording(true);
    } catch (error) {
      console.log("error while recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing 
    }
    const info = await FileSystem.getInfoAsync(recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);

    const blob = new Blob([JSON.stringify(info)], {type : 'audio/json'});
    console.log(blob.blob);
    var fd = new FormData();
    fd.append("audio", blob.blob, "audio.mp3");

    // axios.post(`${baseURLs[env]}/html/audio`, fd).then((resp) => {
    //   console.log(resp);
    //   if (resp.data.transcript) {
    //     console.log(resp.data.transcript);
    //   }
    // });

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound: _sound, status } = await recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: false,
        volume: 1.0,
        rate: 1.0,
        shouldCorrectPitch: true,
      }
    );
    setSound(_sound);
    setIsRecording(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Hi</Text>
        <TextInput
          value={email}
          keyboardType = 'email-address'
          onChangeText={(email) => setEmail(email) }
          placeholder='email'
          placeholderTextColor = 'black'
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={(password) => setPassword(password) }
          placeholder={'password'}
          secureTextEntry={true}
          placeholderTextColor = 'black'
          style={styles.input}
        />
        
     
        {/* <TouchableOpacity
          style={styles.button}
          onPress={onLogin}
       >
         <Text style={styles.buttonText}> Log in </Text>
       </TouchableOpacity> */}
      
       <TouchableOpacity
          onPress={()=> { isRecording ? stopRecording() : startRecording()}}
       >
        {isRecording ? (<Ionicons name="mic" size={32} color="green" />) 
          : (<Ionicons name="mic-off" size={32} color="red" />)
        }
       </TouchableOpacity>
        
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  titleText:{
    fontFamily: 'sans-serif',
    fontSize: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'powderblue',
    width: 200,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText:{
    fontFamily: 'sans-serif',
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 200,
    fontFamily: 'sans-serif',
    fontSize: 20,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginVertical: 10,
  },
});
