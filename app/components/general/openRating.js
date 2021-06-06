import { GOOGLE_PACKAGE_NAME, APPLE_STORE_URL } from '../../config';
import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';
import { ACCEPT_RATING, DECLINE_RATING, INSTALLED } from '../../utils/constants';
import { getAsyncStorageItem, setAsyncStorageItem } from '../../utils/utils';

const openStore = (installed) => {
    recordData(installed, ACCEPT_RATING);
    const iosURL = APPLE_STORE_URL;
    const androidURL = `https://play.google.com/store/apps/details?id=${GOOGLE_PACKAGE_NAME}`
    if (Platform.OS === 'ios') {
        Linking.openURL(iosURL).catch((err) => alert('Please check for the App Store'));
    } else {
        Linking.openURL(androidURL).catch((err) => alert('Please check for Google Play Store'));
    }
}

const recordData = (installed, action) => {
    if (action === ACCEPT_RATING) {
        installed.rated = true;
    } else if (action === DECLINE_RATING && !installed.rated) { }
    setAsyncStorageItem(INSTALLED, installed);
}

export default async function OpenRating() {
    try {
        let installed = await getAsyncStorageItem(INSTALLED);
        installed.timesAsked++;
        installed.lastAsked = Date.now();
        Alert.alert("Rate us", "Would you like to share your review with us?", [
            { text: "Sure", onPress: () => openStore(installed) },
            { text: 'No Thanks!', style: 'cancel', onPress: () => recordData(installed, DECLINE_RATING)
            }
        ])
    } catch(err) {
        console.log(err.message);
    }
}