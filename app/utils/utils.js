import AsyncStorage from '@react-native-async-storage/async-storage';
import { INSTALLED_OLD_DO_NOT_USE, INSTALLED, ACTIVITY, EMERGENCY_NUMBER, BADGES, defaultInstalled, defaultActivity, defaultEmergencyNumber, defaultBadges, RECORDINGS, TO_CLEAN, defaultToClean, DATA, defaultData } from './constants'
import RNFS from 'react-native-fs';

export const elapsedToDays = (ms) => {
    return ms / (24 * 60 * 60 * 1000);
}

export const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    })
}

export const getAsyncStorageItem = async (key) => {
    try {
        let obj = await AsyncStorage.getItem(key)
        if (!obj) {
            return null;
        }
        return JSON.parse(obj);
    } catch (e) {
        throw new Error(e.message);
    }
}

export const getAsyncStorageItemFallback = async (key, fallback) => {
    try {
        let obj = await getAsyncStorageItem(key)
        if (!obj) {
            return fallback;
        }
        return obj;
    } catch (e) {
        throw new Error(e.message);
    }
}

export const setAsyncStorageItem = async (key, data) => {
    try {
        AsyncStorage.setItem(key, JSON.stringify(data));
        return null;
    } catch (e) {
        throw new Error(e.message);
    }
}

export const clearAsyncStorage = () => {
    AsyncStorage.clear((e) => {
        throw new Error(e.message);
    })
}

export const clearAsyncStorageKey = async (key) => {
    await AsyncStorage.removeItem(key);
}

export const logAsyncStorage = async () => {
    let toLog = [
        INSTALLED_OLD_DO_NOT_USE,
        INSTALLED,
        ACTIVITY,
        EMERGENCY_NUMBER,
        BADGES,
        TO_CLEAN,
        RECORDINGS
    ]
    for (log of toLog) {
        let obj = await getAsyncStorageItem(log)
        console.log(log, obj)
    }
    console.log("===========")
}

export const manageAsyncStorage = async () => {
    let toClean = await getAsyncStorageItemFallback(TO_CLEAN, defaultToClean);
    if (toClean.cleanAsyncStorage) {
        toClean.cleanAsyncStorage = false;
        let oldInstalled = await getAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE);
        let newInstalled = await getAsyncStorageItemFallback(INSTALLED, defaultInstalled);
        let activity = await getAsyncStorageItemFallback(ACTIVITY, defaultActivity);
        let emergencyNumber = await getAsyncStorageItemFallback(EMERGENCY_NUMBER, defaultEmergencyNumber);
        let badges = await getAsyncStorageItemFallback(BADGES, defaultBadges);
        if (oldInstalled) {
            if (oldInstalled.installDate !== newInstalled.installDate) {
                newInstalled.installDate = oldInstalled.installDate;
            }
            if (oldInstalled.asked && !newInstalled.rated) {
                newInstalled.rated = true;
            }
            if (oldInstalled.alarm && !activity.alarmPlayed) {
                activity.alarmPlayed = true;
            }
            await clearAsyncStorageKey(INSTALLED_OLD_DO_NOT_USE);
        }
        if (newInstalled.rated && newInstalled.timesAsked === 0) {
            newInstalled.timesAsked = 1;
            newInstalled.lastAsked = Date.now();
        }
        if (activity.numRecordings) {
            delete activity.numRecordings;
        }
        await setAsyncStorageItem(INSTALLED, newInstalled);
        await setAsyncStorageItem(ACTIVITY, activity);
        await setAsyncStorageItem(EMERGENCY_NUMBER, emergencyNumber);
        await setAsyncStorageItem(BADGES, badges);
        await setAsyncStorageItem(TO_CLEAN, toClean);
        await logAsyncStorage();
    }
}

export const cleanRecordings = async () => {
    let toClean = await getAsyncStorageItem(TO_CLEAN);
    if (toClean.cleanRecordings || !('cleanRecordings' in toClean)) {
        toClean.cleanRecordings = false;
        let recordings = await getAsyncStorageItem(RECORDINGS);
        recordings = recordings.map(recording => {
            return {...recording, uri: recording.uri.split("/").pop()};
        })
        await setAsyncStorageItem(TO_CLEAN, toClean);
        await setAsyncStorageItem(RECORDINGS, recordings)
    }
}

export const cleanCameraCache = async () => {
    let toClean = await getAsyncStorageItem(TO_CLEAN);
    let recordings = await getAsyncStorageItemFallback(RECORDINGS, []);
    if (toClean.cleanCameraCache || !('cleanCameraCache' in toClean)) {
        if (!(await RNFS.exists(`${RNFS.DocumentDirectoryPath}/Camera/`))) {
            await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/Camera/`);
        }
        toClean.cleanCameraCache = false;
        let mainDir = `${RNFS.CachesDirectoryPath}/Camera`;
        if (await RNFS.exists(mainDir)) {
            let files = await RNFS.readDir(mainDir);
            files.forEach(async (file) => {
                let fileName = file.path.split("/").pop();
                let filePath = file.path.split("///").pop();
                for (let recording of recordings) {
                    if (recording.uri && recording.uri.split("/").pop() === fileName) {
                        await RNFS.moveFile(filePath, `${RNFS.DocumentDirectoryPath}/Camera/${fileName}`);
                    }
                }
                await deleteFile(filePath);
            })
            await setAsyncStorageItem(TO_CLEAN, toClean);
            await cleanRecordings();
        }
    }
}

export const deleteFile = async (uri) => {
    if (await RNFS.exists(uri)) {
        await RNFS.unlink(uri)
    }
}