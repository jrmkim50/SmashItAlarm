import * as Linking from 'expo-linking';
import Torch from 'react-native-torch';
import { ACTIVITY, AUTO_GEN, COUNTRY_CODE, defaultEmergencyNumber, EMERGENCY_NUMBER, RECORDINGS, USER_GEN } from './constants';
import { clearAsyncStorageKey, getAsyncStorageItem, setAsyncStorageItem } from './utils';
import * as RNLocalize from "react-native-localize";
import { TESTING } from '../config';
import { RNCamera } from 'react-native-camera';
import { Dimensions } from 'react-native';

// Given a ref (to keep track of the flashlight's state), turn on the flashlight
const turnOnFlashlight = async (ref) => {
    ref.current = true;
    try {
        await Torch.switchState(true);
    } catch(err) {
        console.log("NO FLASHLIGHT!")
    }
}

// Given a ref (to keep track of the flashlight's state), turn off the flashlight
const turnOffFlashlight = async (ref) => {
    ref.current = false;
    try {  
        await Torch.switchState(false);
    } catch(err) {
        console.log("NO FLASHLIGHT!")
    }
}

// A function that returns an interval that turns the flashlight on and off
const strobeBehavior = (ref) => {
    let interval = setInterval(() => {
        if (ref.current) {
            turnOffFlashlight(ref); 
        } else {
            turnOnFlashlight(ref);
        }
    }, 1000);

    return interval;
}

// When you turn on the strobe, you need to turn off the strobe, turn on the flashlight (to account for the interval's delay)
export const turnOnStrobe = (torchRef, intervalRef) => {
    turnOffStrobe(torchRef, intervalRef);
    turnOnFlashlight(torchRef);
    let interval = strobeBehavior(torchRef);
    intervalRef.current = interval;
}

// To turn off the strobe, clear the interval stored by intervalRef and turn off the flashlight
export const turnOffStrobe = (torchRef, intervalRef) => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    turnOffFlashlight(torchRef);
}

export const turnOnAlarm = async (alarm) => {
    if (alarm) {
        try {
            await alarm.playFromPositionAsync(0);
            let activity = await getAsyncStorageItem(ACTIVITY);
            if (!activity.alarmPlayed) {
                activity.alarmPlayed = true;
                setAsyncStorageItem(ACTIVITY, activity);
            }
        } catch (err) {
            console.log(err.message)
        }
    }
}

export const turnOffAlarm = async (alarm) => {
    if (alarm) {
        try {
            let { isLoaded } = await alarm.getStatusAsync();
            if (isLoaded) {
                await alarm.pauseAsync();
            }
        } catch (err) {
            console.log(err.message)
        }
    }
}

const handleCameraPermissions = async () => {
    let { status } = await Camera.requestPermissionsAsync();
    if (status === PermissionStatus.GRANTED) {
        return true;
    } else if (status === PermissionStatus.UNDETERMINED) {
        let { status } = await Camera.requestPermissionsAsync();
        if (status === PermissionStatus.GRANTED) {
            return true;
        }
    }
    return false;
}

export const autoRecordStart = async (cameraRef) => {
    // let perms = await handleCameraPermissions();
    try {
        if (cameraRef && cameraRef.current) {
            let activity = await getAsyncStorageItem(ACTIVITY);
            let recordings = await getAsyncStorageItem(RECORDINGS); 
            let video = await cameraRef.current.recordAsync();
            console.log(video);
            recordings = recordings ? recordings : [];
            const windowWidth = Dimensions.get('window').width;
            const windowHeight = Dimensions.get('window').height;
            aspect_ratio = windowWidth / windowHeight;
            recordings.push({ uri: video.uri, type: "video", aspect_ratio: aspect_ratio });
            activity.numRecordings = recordings.length;
            await setAsyncStorageItem(ACTIVITY, activity);
            await setAsyncStorageItem(RECORDINGS, recordings);
        }
    } catch (err) {
        console.log("camera: ", err)
    }
}

export const autoRecordStop = (cameraRef) => {
    try {
        if (cameraRef && cameraRef.current) {
            cameraRef.current.stopRecording();
        }
    } catch(err) {
        console.log(err);
    }
}

// Gives either the current country code or defaults to US
const getCountryCode = async () => {
    try {
        let countryCode = RNLocalize.getCountry();
        return countryCode;
    } catch(err) {
        console.log(err);
        let lastCountryCode = "US";
        return lastCountryCode;
    }
}

export const getPhoneNumber = async () => {
    let emergency_numbers = require("../assets/emergency_numbers.json");
    let countryCode = await getCountryCode();
    let numbers = emergency_numbers.find(country => country.Country.ISOCode === countryCode);
    return numbers.Police.All[0] ? numbers.Police.All[0] : "911";
}

export const getSavedPhoneNumber = async () => {
    let savedNumberData = await getAsyncStorageItem(EMERGENCY_NUMBER);
    return savedNumberData;
}

// Given an emergency numbers, this function will save that number.
// If this process was started automatically, the number only saves if the savedNumberData's auto generate
// feature is on and if it is a new number. If this process was started manually, the auto generate feature will 
// turn off in the future and we will save the new number
export const savePhoneNumber = async (number, entity) => {
    let numberData = {...defaultEmergencyNumber};
    numberData.number = number;

    let savedNumberData = await getSavedPhoneNumber();
    if (!savedNumberData) {
        await setAsyncStorageItem(EMERGENCY_NUMBER, numberData);
        return;
    }
    if (entity === AUTO_GEN && savedNumberData.auto_generate && numberData.number !== savedNumberData.number) {
        await setAsyncStorageItem(EMERGENCY_NUMBER, numberData);
    }
    if (entity === USER_GEN) {
        numberData.auto_generate = false;
        await setAsyncStorageItem(EMERGENCY_NUMBER, numberData);
    }
}

export const saveNumberData = async (data) => {
    await setAsyncStorageItem(EMERGENCY_NUMBER, data);
}

export const initiateCall = async (phoneNumber) => {
    try {
        Linking.openURL("tel:" + phoneNumber);
    } catch(err) {
        alert(`We had some trouble calling ${phoneNumber}`);
    }
}