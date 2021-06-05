import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator, TextInput } from 'react-native'
import ActivityWindow from '../components/general/ActivityWindow';
import OpenRating from '../components/general/OpenRating';
import { getSavedPhoneNumber, savePhoneNumber, getPhoneNumber } from '../utils/alarm';
import { RECORDINGS, USER_GEN, AUTO_GEN, BADGES, EMERGENCY_NUMBER, defaultEmergencyNumber, defaultBadges } from '../utils/constants';
import { screenStyle } from '../utils/styles';
import { clearAsyncStorageKey, deleteFile, getAsyncStorageItem, manageAsyncStorage, setAsyncStorageItem, sleep } from '../utils/utils';
import RNFS from 'react-native-fs';

export default function SettingsScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [emergencyNumber, setEmergencyNumber] = useState(null);
    const [tempEmergencyNumber, setTempEmergencyNumber] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [automatically, setAutomatically] = useState(true);

    useEffect(() => {
        getSavedPhoneNumber().then(numberData => {
            numberData = numberData ? numberData : defaultEmergencyNumber;
            setEmergencyNumber(numberData.number);
            setAutomatically(numberData.auto_generate);
            setLoadingData(false);
        })
        getAsyncStorageItem(BADGES).then(result => {
            let badges = result ? result : defaultBadges;
            badges.checkEmergencyServicesSettings = false;
            navigation.setOptions({ tabBarBadge: 0 })
            setAsyncStorageItem(BADGES, badges);
        })
    }, [])

    const clearData = () => {
        Alert.alert("Clear Recordings", "Press Ok to delete your recordings", [
            { text: "Cancel", style: 'cancel' },
            { text: "Ok", onPress: async () => {
                try {
                    let recordings = await getAsyncStorageItem(RECORDINGS);
                    let files = await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/Camera/`);
                    files.forEach(async file => {
                        await deleteFile(file.path);
                    })
                    if (recordings && recordings.length > 0) {
                        setLoading(true);
                        await sleep(500);
                        await clearAsyncStorageKey(RECORDINGS);
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

    const toggleAutoGeneration = async () => {
        let numberData = await getSavedPhoneNumber();
        numberData.auto_generate = !automatically;
        await setAsyncStorageItem(EMERGENCY_NUMBER, numberData);
        setAutomatically(!automatically);
        if (numberData.auto_generate) {
            let number = await getPhoneNumber()
            await savePhoneNumber(number, AUTO_GEN);
            setEmergencyNumber(number)
        }
    }

    const saveNewNumber = async (number) => {
        await savePhoneNumber(number, USER_GEN);
        setEmergencyNumber(number);
        setTempEmergencyNumber(null);
    }

    const changeNumber = () => {
        saveNewNumber(tempEmergencyNumber)
    }

    return (
        <SafeAreaView style={screenStyle.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container} >
                    <Text style={styles.header}>Settings</Text>
                    <TouchableOpacity style={styles.button} onPress={OpenRating}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>Rate us!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearData} style={[styles.button, {backgroundColor: 'rgba(204,64,57,1)'}]}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>Clear my recordings</Text>
                    </TouchableOpacity>
                    <Text style={styles.emergencyNumber}>Emergency Services: {emergencyNumber}</Text>
                    {loadingData && 
                        <ActivityIndicator/>
                    }
                    {!loadingData &&
                        <TouchableOpacity onPress={toggleAutoGeneration} style={[styles.button, { backgroundColor: 'rgba(14,104,207,1)'}]}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Set Emergency Number {automatically ? "Manually" : "Automatically"}</Text>
                        </TouchableOpacity>
                    }
                    {(!loadingData && !automatically) && 
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                            <TextInput placeholder="Enter new number here" style={{ flex: 1, padding: 5, borderBottomWidth: 1, borderColor: 'gray', marginRight: 15 }} onChangeText={setTempEmergencyNumber} value={tempEmergencyNumber} placeholderTextColor="gray"/>
                            <TouchableOpacity onPress={changeNumber} style={[styles.smallButton, { backgroundColor: 'rgba(204,64,57,1)'}]}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Enter</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    <Text style={styles.emergencyNumber}>Email us at smash.alarm@gmail.com</Text>
                    {/* <Feedback setLoading = {setLoading}/> */}
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
    },
    smallButton: {
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
    },
    emergencyNumber: {
        padding: 10,
        marginTop: 20,
        fontSize: 22, 
        alignSelf: 'flex-start',
        fontWeight: 'bold'
    }
})