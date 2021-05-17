import AsyncStorage from '@react-native-async-storage/async-storage';

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