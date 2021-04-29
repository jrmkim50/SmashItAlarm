import { GOOGLE_PACKAGE_NAME, APPLE_STORE_URL } from '../../config';
import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';
import { YES, NO } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const openStore = () => {
    const iosURL = APPLE_STORE_URL;
    const androidURL = `https://play.google.com/store/apps/details?id=${GOOGLE_PACKAGE_NAME}`
    if (Platform.OS === 'ios') {
        Linking.openURL(iosURL).catch((err) => alert('Please check for the App Store'));
    } else {
        Linking.openURL(androidURL).catch((err) => alert('Please check for Google Play Store'));
    }
    recordData(YES);
}

const recordData = (action) => {
    if (action === YES) {
        //record yes
    } else {
        //record no
    }
}

export default async function openRating() {
    try {
        let installed = JSON.parse(await AsyncStorage.getItem("installed"));
        installed.asked = true;
        await AsyncStorage.setItem("installed", JSON.stringify(installed));
    } catch(err) {
        console.log(err.message);
    }
    Alert.alert("Rate us", "Would you like to share your review with us?", [
        { text: "Sure", onPress: openStore },
        { text: 'No Thanks!', style: 'cancel', onPress: () => recordData(NO)
        }
    ])
}