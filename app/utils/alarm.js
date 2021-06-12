import * as Linking from 'expo-linking';
import Torch from 'react-native-torch';
import { ACTIVITY, AUTO_GEN, COUNTRY_CODE, defaultEmergencyNumber, EMERGENCY_NUMBER, RECORDINGS, USER_GEN } from './constants';
import { clearAsyncStorageKey, getAsyncStorageItem, getAsyncStorageItemFallback, setAsyncStorageItem, sleep } from './utils';
import * as RNLocalize from "react-native-localize";
import { TESTING } from '../config';
import { RNCamera } from 'react-native-camera';
import { Dimensions } from 'react-native';
import RNFS from 'react-native-fs';
import { MediaStates } from '@react-native-community/audio-toolkit';

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
    let count = 0;
    let interval = setInterval(() => {
        if (count != 0) {
            if (ref.current) {
                turnOffFlashlight(ref); 
            } else {
                turnOnFlashlight(ref);
            }
        }
        count++;
    }, 1000);

    return interval;
}

// When you turn on the strobe, you need to turn off the strobe, turn on the flashlight (to account for the interval's delay)
export const turnOnStrobe = (torchRef, intervalRef) => {
    turnOffStrobe(torchRef, intervalRef);
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
            let activity = await getAsyncStorageItem(ACTIVITY);
            if (!activity.alarmPlayed) {
                activity.alarmPlayed = true;
                setAsyncStorageItem(ACTIVITY, activity);
            }
            console.log(alarm)
            alarm.play();
        } catch (err) {
            console.log(err.message)
        }
    }
}

export const turnOffAlarm = async (alarm) => {
    if (alarm) {
        try {
            if (alarm.state === MediaStates.PLAYING) {
                alarm.pause();
            }
        } catch (err) {
            console.log(err.message)
        }
    }
}

const getAspectRatio = (deviceOrientation) => {
    let portrait = 1;
    let landscape = 3;
    if (deviceOrientation === portrait) {
        return 0.75;
    } else if (deviceOrientation === landscape) {
        return 4/3;
    }
}

export const autoRecordStart = async (cameraRef) => {
    try {
        if (cameraRef && cameraRef.current) {
            let { uri, deviceOrientation } = await cameraRef.current.recordAsync({ videoBitrate: 0.25 * 1000 * 1000, quality: RNCamera.Constants.VideoQuality['4:3'] });
            await saveVideo(uri, deviceOrientation);
        } else {
            throw new Error("No camera yet!")
        }
    } catch (err) {
        throw new Error(err)
    }
}

const saveVideo = async (uri, deviceOrientation) => {
    let fileName = uri.split("/").pop()
    RNFS.moveFile(uri.split("///").pop(), `${RNFS.DocumentDirectoryPath}/Camera/${fileName}`);
    let recordings = await getAsyncStorageItemFallback(RECORDINGS, []); 
    let aspect_ratio = getAspectRatio(deviceOrientation);
    recordings.push({ uri: fileName, type: "video", aspect_ratio: aspect_ratio });
    await setAsyncStorageItem(RECORDINGS, recordings);
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
const getCountryCode = () => {
    return RNLocalize.getCountry();
}

export const getPhoneNumber = () => {
    let emergency_numbers = require("../assets/emergency_numbers.json");
    let countryCode = getCountryCode();
    let numbers = emergency_numbers.find(country => country.Country.ISOCode === countryCode);
    return (numbers && numbers.Police && numbers.Police.All && numbers.Police.All[0]) ? numbers.Police.All[0] : "911";
}

// Given an emergency numbers, this function will save that number.
// If this process was started automatically, the number only saves if the savedNumberData's auto generate
// feature is on and if it is a new number. If this process was started manually, the auto generate feature will 
// turn off in the future and we will save the new number
export const savePhoneNumber = async (number, entity) => {
    let savedNumberData = await getAsyncStorageItemFallback(EMERGENCY_NUMBER, defaultEmergencyNumber);
    if (entity === AUTO_GEN && savedNumberData.auto_generate && number !== savedNumberData.number) {
        savedNumberData.number = number;
        await setAsyncStorageItem(EMERGENCY_NUMBER, savedNumberData);
    }
    if (entity === USER_GEN && !savedNumberData.auto_generate) {
        savedNumberData.number = number;
        await setAsyncStorageItem(EMERGENCY_NUMBER, savedNumberData);
    }
}

export const initiateCall = async (phoneNumber) => {
    try {
        Linking.openURL("tel:" + phoneNumber);
    } catch(err) {
        alert(`We had some trouble calling ${phoneNumber}`);
    }
}