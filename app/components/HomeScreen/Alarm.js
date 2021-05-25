import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { useState, useEffect, useRef } from 'react';
import { PLAYING, PAUSED, LOADING, RECORDINGS, ACTIVITY, tabBarHeight } from '../../utils/constants';
import { getAsyncStorageItem, setAsyncStorageItem, sleep } from '../../utils/utils';
import * as ImagePicker from 'expo-image-picker';
import { turnOnStrobe, turnOffStrobe, initiateCall, turnOnAlarm, turnOffAlarm, getSavedPhoneNumber, autoRecordStart, autoRecordStop } from '../../utils/alarm';
import { RNCamera } from 'react-native-camera';
import { INTERRUPTION_MODE_ANDROID_DUCK_OTHERS } from 'expo-av/build/Audio';

export default function Alarm({ setLoading, setSuccess }) {
    const [alarm, setAlarm] = useState(null);
    const [soundState, setSoundState] = useState(LOADING);
    const [strobeState, setStrobeState] = useState(PAUSED);
    const [recordingState, setRecordingState] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("911");
    const [isAutoRecord, setIsAutoRecord] = useState(false);

    const alarmSource = "../../assets/Alarm-Slow-A2.mp3";
    const torchRef = useRef();
    const intervalRef = useRef();
    const cameraRef = useRef();

    useEffect(() => {
        turnOffStrobe(torchRef, intervalRef);
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: true,
            interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
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
        getSavedPhoneNumber().then(number => {
            setPhoneNumber((number && number.number) ? number.number : "911");
        });
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
            autoRecordStart(cameraRef);
            setIsAutoRecord(true);
        } else if (soundState === PAUSED) {
            turnOffAlarm(alarm);
            if (isAutoRecord) {
                autoRecordStop(cameraRef);
                setIsAutoRecord(false);
            }
        }
    }, [soundState])

    useEffect(() => {
        if (strobeState === PLAYING) {
            turnOnStrobe(torchRef, intervalRef);
        } else {
            turnOffStrobe(torchRef, intervalRef);
        }
    }, [strobeState])

    // useEffect(() => {
    //     if (!recordingState) {
    //         if (strobeState === PLAYING) {
    //             turnOnStrobe(torchRef, intervalRef);
    //         }
    //         if (soundState === PLAYING) {
    //             turnOnAlarm(alarm);
    //         }
    //     }
    // }, [recordingState]) 

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
            // try {
            //     turnOffStrobe(torchRef, intervalRef);
            //     await turnOffAlarm(alarm);
            // } catch (err) {
            //     console.log(err.message);
            //     return;
            // }
            autoRecordStop(cameraRef);
            setRecordingState(true);
            setIsAutoRecord(false);
            let activity = await getAsyncStorageItem(ACTIVITY);
            let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
            if (!result.cancelled) {
                setLoading(true);
                await sleep(500);
                let recordings = await getAsyncStorageItem(RECORDINGS);
                recordings = recordings ? recordings : [];
                recordings.push({ uri: result.uri, type: result.type, aspect_ratio: result.width / result.height });
                activity.numRecordings = recordings.length;
                await setAsyncStorageItem(ACTIVITY, activity);
                await setAsyncStorageItem(RECORDINGS, recordings);
                setSuccess(true);
                await sleep(500);
                setLoading(false);
                setSuccess(false);
            }
            setRecordingState(false);
            setIsAutoRecord(true);
            autoRecordStart(cameraRef);
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
                <TouchableOpacity style={[styles.alarmButton, styles.success]} onPress={openCamera} disabled={recordingState}>
                    <Text style={styles.text}>Start Recording</Text>
                </TouchableOpacity>
            }
            {soundState === PLAYING &&
                <TouchableOpacity style={[styles.smallButton, styles.secondary]} onPress={strobeState === PLAYING ? () => setStrobeState(PAUSED) : () => setStrobeState(PLAYING)}>
                    <Text style={styles.smallText}>{strobeState === PLAYING ? "Turn off Strobe" : "Turn on Strobe"}</Text>
                </TouchableOpacity>
            }
            <View style={styles.cameraView}>
            <RNCamera 
                ref={ref => { cameraRef.current = ref }}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera for auto-record functionality',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel',
                }} 
                androidRecordAudioPermissionOptions={{
                    title: 'Permission to use audio recording',
                    message: 'We need your permission to use your microphone for auto-record functionality',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel',
                }}
                captureAudio={true}
                flashMode={RNCamera.Constants.FlashMode.off}
                type={RNCamera.Constants.Type.back} 
                style={styles.camera}
            />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        width: '95%',
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
    },
    cameraView: {
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: 150,
        width: 150,
        overflow: 'hidden'
    },
    camera: {
        flex: 1,
        maxHeight: 150,
        justifyContent: 'flex-start',
        alignItems: 'center',
    }
})