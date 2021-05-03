import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native'
import ActivityWindow from '../components/general/ActivityWindow';
import openRating from '../components/general/openRating';
import Feedback from '../components/SettingsScreen/Feedback';
import { screenStyle } from '../utils/styles';
import { sleep } from '../utils/utils';

export default function SettingsScreen() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const clearData = () => {
        Alert.alert("Clear Recordings", "Press Ok to delete your recordings", [
            { text: "Cancel", style: 'cancel' },
            { text: "Ok", onPress: async () => {
                try {
                    let recordings = await AsyncStorage.getItem("recordings");
                    recordings = JSON.parse(recordings);
                    if (recordings && recordings.length > 0) {
                        setLoading(true);
                        await sleep(500);
                        await AsyncStorage.removeItem("recordings");
                        setSuccess(true);
                        await sleep(500);
                        setLoading(false);
                        setSuccess(false);
                    } else {
                        alert("Nothing to delete!")
                    }
                    
                } catch(err) {
                    console.log(err.message)
                }
            } },
        ])
    }

    return (
        <SafeAreaView style={screenStyle.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container} >
                    <Text style={styles.header}>Settings</Text>
                    <TouchableOpacity style={styles.button} onPress={openRating}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>Rate us!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearData} style={[styles.button, {backgroundColor: 'rgba(204,64,57,1)'}]}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>Clear my recordings</Text>
                    </TouchableOpacity>
                    <Feedback setLoading = {setLoading}/>
                    {loading && <ActivityWindow loading={loading} success={success}/>}
                </View>
            </TouchableWithoutFeedback> 
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        padding: 10,
    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
        padding: 10,
        alignSelf: 'flex-start'
    },
    button: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(67,133,66,1)',
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 3, width: 0 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 5, //IOS
        elevation: 2, // Android
        
    }
})