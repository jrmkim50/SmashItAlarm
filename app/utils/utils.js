import AsyncStorage from '@react-native-async-storage/async-storage';
import { INSTALLED_OLD_DO_NOT_USE, INSTALLED, ACTIVITY, EMERGENCY_NUMBER, BADGES } from './constants'

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
    } catch(e) {
        throw new Error(e.message);
    }
}

export const setAsyncStorageItem = async (key, data) => {
    try {
        AsyncStorage.setItem(key, JSON.stringify(data));
        return null;
    } catch(e) {
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
        BADGES
    ]
    for (log of toLog) {
        let obj = await getAsyncStorageItem(log)
        console.log(obj)
    }
    console.log("===========")
}