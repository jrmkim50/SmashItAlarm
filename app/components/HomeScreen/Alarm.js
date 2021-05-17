import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { useState, useEffect, useRef } from 'react';
import { PLAYING, PAUSED, LOADING, RECORDINGS, ACTIVITY } from '../../utils/constants';
import { getAsyncStorageItem, setAsyncStorageItem, sleep } from '../../utils/utils';
import * as ImagePicker from 'expo-image-picker';
import { turnOnStrobe, turnOffStrobe, initiateCall, turnOnAlarm, turnOffAlarm, getSavedPhoneNumber } from '../../utils/alarm';

export default function Alarm({ setLoading, setSuccess }) {
    const [alarm, setAlarm] = useState(null);
    const [soundState, setSoundState] = useState(LOADING);
    const [strobeState, setStrobeState] = useState(PAUSED);
    const [recordingState, setRecordingState] = useState(false);

    const alarmSource = "../../assets/Alarm-Slow-A2.mp3";
    const torchRef = useRef();
    const intervalRef = useRef();

    let phoneNumber = "911";
    getSavedPhoneNumber().then(number => {
        phoneNumber = number.number;
        phoneNumber = phoneNumber ? phoneNumber : "911";
    });

    useEffect(() => {
        turnOffStrobe(torchRef, intervalRef);
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
                    console.log(err.message);
                }
            }
        }
    }, [alarm])

    useEffect(() => {
        if (soundState === PLAYING) {
            turnOnAlarm(alarm);
        } else if (soundState === PAUSED) {
            turnOffAlarm(alarm);
        }
    }, [soundState])

    useEffect(() => {
        if (strobeState === PLAYING) {
            turnOnStrobe(torchRef, intervalRef);
        } else {            
            turnOffStrobe(torchRef, intervalRef);
        } 
    }, [strobeState])

    useEffect(() => {
        if (!recordingState) {
            if (strobeState === PLAYING) {
                turnOnStrobe(torchRef, intervalRef);
            }
            if (soundState === PLAYING) {
                turnOnAlarm(alarm);
            }
        }
    }, [recordingState]) 

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
                turnOffStrobe(torchRef, intervalRef);
                await turnOffAlarm(alarm);
            } catch (err) {
                console.log(err.message);
                return;
            }
            setRecordingState(true);
            let activity = await getAsyncStorageItem(ACTIVITY);
            let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
            if (!result.cancelled) { 
                setLoading(true);
                await sleep(500);
                let recordings = await getAsyncStorageItem(RECORDINGS);
                recordings = recordings ? recordings : [];
                recordings.push({ uri: result.uri, type: result.type, aspect_ratio: result.width / result.height });
                activity.numRecordings++;
                await setAsyncStorageItem(ACTIVITY, activity);
                await setAsyncStorageItem(RECORDINGS, recordings);
                setSuccess(true);
                await sleep(500);
                setLoading(false);
                setSuccess(false);
            }
            setRecordingState(false);
        } catch (err) {
            setRecordingState(false);
            alert("We had some trouble accessing the camera!")
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
                <TouchableOpacity style={[styles.alarmButton, styles.secondary]} onPress={() => initiateCall(phoneNumber)}>
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