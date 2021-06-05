import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, AppState } from 'react-native';
import { Player, PlaybackCategories } from '@react-native-community/audio-toolkit';
import { useState, useEffect, useRef } from 'react';
import { PLAYING, PAUSED, LOADING, RECORDINGS, ACTIVITY, tabBarHeight, EMERGENCY_NUMBER, defaultEmergencyNumber } from '../../utils/constants';
import { turnOnStrobe, turnOffStrobe, initiateCall, turnOnAlarm, turnOffAlarm, autoRecordStart, autoRecordStop } from '../../utils/alarm';
import { RNCamera } from 'react-native-camera';
import { getAsyncStorageItemFallback, manageAsyncStorage } from '../../utils/utils';

export default function Alarm({ setLoading, setSuccess }) {
    const [alarm, setAlarm] = useState(null);
    const [soundState, setSoundState] = useState(LOADING);
    const [strobeState, setStrobeState] = useState(PAUSED);
    const [phoneNumber, setPhoneNumber] = useState("911");
    const [isAutoRecord, setIsAutoRecord] = useState(false);

    const alarmSource = "Alarm-Slow-A2.mp3"; // 
    const torchRef = useRef();
    const intervalRef = useRef();
    const cameraRef = useRef();
    const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

    useEffect(() => {
        turnOffStrobe(torchRef, intervalRef);
        let player = new Player(alarmSource, { autoDestroy: false, category: PlaybackCategories.SoloAmbient })
        player.isLooping = true;
        setSoundState(PAUSED);
        setAlarm(player);
        getAsyncStorageItemFallback(EMERGENCY_NUMBER, defaultEmergencyNumber).then(number => {
            setPhoneNumber(number.number);
        });
        AppState.addEventListener("change", _handleAppStateChange);
        return () => {
            AppState.removeEventListener("change", _handleAppStateChange);
        };
    }, [])

    const _handleAppStateChange = (nextAppState) => {
        setAppStateVisible(nextAppState);
    };

    useEffect(() => {
        if (appStateVisible === "background") {
            cameraRef.current = null;
            setSoundState(PAUSED);
            setStrobeState(PAUSED);
            setIsAutoRecord(false);
        }
    }, [appStateVisible])

    useEffect(() => {
        return () => {
            if (alarm) {
                try {
                    alarm.destroy();
                } catch (err) {
                    console.log(err.message);
                }
            }
        }
    }, [alarm])

    useEffect(() => {
        if (soundState === PLAYING) {
            turnOnAlarm(alarm);
            // autoRecordStart(cameraRef)
        } else if (soundState === PAUSED) {
            turnOffAlarm(alarm);
            // if (isAutoRecord) {
            //     autoRecordStop(cameraRef);
            // }
        }
    }, [soundState])

    useEffect(() => {
        if (strobeState === PLAYING) {
            turnOnStrobe(torchRef, intervalRef);
        } else {
            turnOffStrobe(torchRef, intervalRef);
        }
    }, [strobeState])

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

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPress}
                style={soundState === LOADING ? 
                        [styles.alarmButton, styles.loading, styles.warning] :
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
                <TouchableOpacity style={[styles.smallButton, styles.secondary]} onPress={strobeState === PLAYING ? 
                                                                                            () => setStrobeState(PAUSED) : 
                                                                                            () => setStrobeState(PLAYING)}>
                    <Text style={styles.smallText}>{strobeState === PLAYING ? "Turn off Strobe" : "Turn on Strobe"}</Text>
                </TouchableOpacity>
            }
            <View style={styles.cameraView}>
                <RNCamera
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
                    flashMode={RNCamera.Constants.FlashMode.off}
                    type={RNCamera.Constants.Type.back}
                    style={styles.camera}
                    onRecordingStart={() => {
                        setIsAutoRecord(true);
                    }}
                    onRecordingEnd={() => {
                        setIsAutoRecord(false);
                    }}
                >
                    {({ camera, status, recordAudioPermissionStatus }) => {
                        if (camera && recordAudioPermissionStatus === 'AUTHORIZED' && 
                            status === 'READY') {
                                cameraRef.current = camera;
                                return <View></View>
                        } else {
                            return <View><Text>Please allow permissions to use auto-record functionality</Text></View>
                        }
                    }}
                </RNCamera>
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
        aspectRatio: 3 / 4,
        overflow: 'hidden'
    },
    camera: {
        flex: 1,
        maxHeight: 150,
        justifyContent: 'flex-start',
        alignItems: 'center',
    }
})