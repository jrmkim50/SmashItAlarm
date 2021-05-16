import AsyncStorage from '@react-native-async-storage/async-storage';

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
        return e.message;
    }
}

export const setAsyncStorageItem = async (key, data) => {
    try {
        AsyncStorage.setItem(key, JSON.stringify(data));
        return null;
    } catch(e) {
        return e.message;
    }
}