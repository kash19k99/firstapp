import { StatusBar } from 'expo-status-bar';
import React , {useState, useEffect} from 'react';
import { Alert, Button, Text, TouchableOpacity, TextInput, View, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';


export default function App() {

  const [isRecording, setIsRecording ] = useState(false);
  const [isFetching, setIsFetching ] = useState(false);
  const [recording, setRecording ] = useState(null);
  const [email, setEmail] = useState('user');
  const [password, setPassword] = useState('password');
  const [command, setCommand] = useState(null);
  const [query, setQuery] = useState(null);

  const recordingOptions = {
    // android not currently in use, but parameters are required
    android: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    },
    ios: {
        extension: '.wav',
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
};

const ENCODING = 'LINEAR16';
const SAMPLE_RATE_HERTZ = 41000;
const LANGUAGE = 'en-US';

  const startRecording = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status !== 'granted') return;
  
    setIsRecording(true);
    // some of these are not applicable, but are required
    await Audio.setAudioModeAsync({

      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true,
  
    });
    const recording = new Audio.Recording();
    try {
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
    } catch (error) {
      console.log(error);
      stopRecording();
    }
    setRecording(recording);
  }

  const stopRecording = () => {
    setIsRecording(false);
  }

  const getTranscription = async () => {
    setIsFetching(true);
    try {
      const info = await FileSystem.getInfoAsync(recording.getURI());
      console.log(`FILE INFO: ${JSON.stringify(info)}`);
      const uri = info.uri;
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/x-wav',
        // could be anything 
        name: 'speech2text'
      });
      const response = await fetch(config.CLOUD_FUNCTION_URL, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setQuery(data.transcript);
    } catch(error) {
      console.log('There was an error', error);
      stopRecording();
      //resetRecording();
    }
    setIsFetching(false);
  }

  const ids = ["email", "password"];

  useEffect(() => {
    // Case 1: Select command
    if (command.startsWith("select")) {
      let id = command.split("select")[1].trim().toLowerCase();
      setSelectedId(id);
      if (document.getElementById(id)) {
        document.getElementById(id).style.backgroundColor = "#DAF7A6";

        for (let remainingId of ids) {
          if (remainingId !== id) {
            document.getElementById(remainingId).style.backgroundColor =
              "transparent";
          }
        }
      }
    } else if (command.startsWith("insert")) {
      let value = command.split("insert")[1].trim().toLowerCase();
      if (document.getElementById(selectedId)) {
        document.getElementById(selectedId).value = value;
      }
    } else if (command.startsWith("clear")) {
      let id = command.split("clear")[1].trim().toLowerCase();

      if (document.getElementById(id)) {
        document.getElementById(id).value = "";
      }
    }
  }, [command]);
  
  const onLogin = () => {

    Alert.alert('Credentials', `email: ${email} and password: ${password}`);
  }

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
        
     
        <TouchableOpacity
          style={styles.button}
          onPress={onLogin}
       >
         <Text style={styles.buttonText}> Log in </Text>
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
