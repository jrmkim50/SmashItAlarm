import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { useState, useEffect, useRef } from 'react';
import { PLAYING, PAUSED, LOADING } from '../../utils/constants';
import * as Linking from 'expo-linking';
import { sleep } from '../../utils/utils';
import Torch from 'react-native-torch';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Alarm({ setLoading, setSuccess }) {
    const [alarm, setAlarm] = useState(null);
    const [soundState, setSoundState] = useState(LOADING);
    const [strobeState, setStrobeState] = useState(PAUSED);
    const [recordingState, setRecordingState] = useState(false);

    const alarmSource = "../../assets/Alarm-Slow-A2.mp3";
    const torchRef = useRef();
    const intervalRef = useRef();

    const phoneNumber = "911";

    useEffect(() => {
        turnOffStrobe();
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true
        }).then(() => {
            Audio.Sound.createAsync(require(alarmSource), { isLooping: true }).then(({ sound }) => {
                setSoundState(PAUSED);
                setAlarm(sound);
            }).catch(err => {
                console.log(err.message);
            })
        }).catch(err => {
            console.log(err.message)
        })
    }, [])

    useEffect(() => {
        return () => {
            if (alarm) {
                try {
                    alarm.unloadAsync();
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }, [alarm])

    useEffect(() => {
        if (soundState === PLAYING) {
            turnOnAlarm();
        } else if (soundState === PAUSED) {
            turnOffAlarm();
        }
    }, [soundState])

    useEffect(() => {
        if (strobeState === PLAYING) {
            turnOnStrobe();
        } else {            
            turnOffStrobe();
        } 
    }, [strobeState])

    useEffect(() => {
        if (!recordingState) {
            if (strobeState === PLAYING) {
                turnOnStrobe();
            }
            if (soundState === PLAYING) {
                turnOnAlarm();
            }
        }
    }, [recordingState])

    const strobeBehavior = () => {
        let interval = setInterval(() => {
            if (torchRef.current) {
                turnOffFlashlight(); 
            } else {
                turnOnFlashlight();
            }
        }, 1000);

        return interval;
    }

    const turnOnFlashlight = () => {
        torchRef.current = true;
        try {
            Torch.switchState(true);
        } catch(err) {
            console.log("NO FLASHLIGHT!")
        }
    }

    const turnOffFlashlight = () => {
        torchRef.current = false;
        try {
            Torch.switchState(false);
        } catch(err) {
            console.log("NO FLASHLIGHT!")
        }
    }

    const turnOffStrobe = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        turnOffFlashlight();
    }

    const turnOnStrobe = () => {
        turnOffStrobe();
        turnOnFlashlight();
        let interval = strobeBehavior();
        intervalRef.current = interval; 
    }

    const initiateCall = async () => {
        Linking.openURL("tel:" + phoneNumber);
    }

    const turnOnAlarm = async () => {
        if (alarm) {
            try {
                await alarm.playFromPositionAsync(0);
            } catch (err) {
                console.log(err.message)
            }
        }
    }

    const turnOffAlarm = async () => {
        if (alarm) {
            try {
                await alarm.pauseAsync();
            } catch (err) {
                console.log(err.message)
            }
        }
    }

    const onPress = async () => {
        if (alarm) {
            if (soundState === PAUSED) {
                setSoundState(PLAYING);
                setStrobeState(PLAYING);
            } else if (soundState === PLAYING) {
                setSoundState(PAUSED);
                setStrobeState(PAUSED);
            }
        }
    }

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }
        try {
            try {
                turnOffStrobe();
                await turnOffAlarm();
            } catch (err) {
                console.log(err);
                return;
            }

            setRecordingState(true);
            let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
            if (!result.cancelled) { 
                setLoading(true);
                await sleep(500);
                let recordings = JSON.parse(await AsyncStorage.getItem("recordings"));
                if (!recordings) {
                    recordings = [];
                }
                recordings.push({ uri: result.uri, type: result.type, aspect_ratio: result.width / result.height });
                await AsyncStorage.setItem("recordings", JSON.stringify(recordings));
                setSuccess(true);
                await sleep(500);
                setLoading(false);
                setSuccess(false);
            }
            setRecordingState(false);
        } catch (err) {
            console.log(err.message)
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPress} 
                              style={soundState === LOADING ? [styles.alarmButton, styles.loading, styles.warning] : 
                                                              [styles.alarmButton, styles.warning]} 
                              disabled={soundState === LOADING}>
                <Text style={styles.text}>{(soundState === PAUSED || soundState === LOADING) ? "Activate Alarm!" : "Stop Alarm!"}</Text>
            </TouchableOpacity>
            {soundState === PLAYING &&
                <TouchableOpacity style={[styles.alarmButton, styles.secondary]} onPress={initiateCall}>
                    <Text style={styles.text}>Emergency Services</Text>
                </TouchableOpacity>
            }
            {soundState === PLAYING &&
                <TouchableOpacity style={[styles.alarmButton, styles.success]} onPress={openCamera}>
                    <Text style={styles.text}>Start Recording</Text>
                </TouchableOpacity>
            }
            {soundState === PLAYING &&
                <TouchableOpacity style={[styles.smallButton, styles.secondary]} onPress={strobeState === PLAYING ? () => setStrobeState(PAUSED) : () => setStrobeState(PLAYING)}>
                    <Text style={styles.smallText}>{strobeState === PLAYING ? "Turn off Strobe" : "Turn on Strobe"}</Text>
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    alarmButton: {
        alignItems: "center",
        padding: 20,
        borderRadius: 10,
        margin: 10,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 3, width: 0 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 5, //IOS
        elevation: 2, // Android
    },
    warning: {
        backgroundColor: 'rgba(204,64,57,1)',
    },
    secondary: {
        backgroundColor: 'rgba(110,117,124,1)'
    },
    success: {
        backgroundColor: 'rgba(67,133,66,1)'
    },
    smallButton: {
        alignItems: "center",
        padding: 15,
        borderRadius: 10,
        margin: 10,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 3, width: 0 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 5, //IOS
        backgroundColor: 'rgba(204,64,57,1)',
        elevation: 2, // Android
    },
    loading: {
        opacity: 0.5
    },
    text: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    smallText: {
        fontSize: 20,
        color: 'white',
    }
})