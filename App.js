import React, { useEffect } from 'react';
import OpenRating from './app/components/general/OpenRating';
import { analyzeInstalledData } from './app/utils/analytics';
import AppNavigation from './app/navigation/AppNavigation';
import { getPhoneNumber, savePhoneNumber } from './app/utils/alarm';
import { AUTO_GEN, EMERGENCY_NUMBER, INSTALLED_OLD_DO_NOT_USE } from './app/utils/constants';
import { cleanCameraCache, cleanRecordings, clearAsyncStorage, logAsyncStorage, manageAsyncStorage, setAsyncStorageItem } from './app/utils/utils';
// import messaging from '@react-native-firebase/messaging';

export default function App() {
  // setAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE, { installDate: 1621136883407, asked: true })
  useEffect(() => {
    // let fcmUnsubscribe = null;
    // messaging().requestPermission().then(authStatus => {
    //   if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
    //     console.log("remote registered: ", messaging().isDeviceRegisteredForRemoteMessages)
    //     console.log("auto init: ", messaging().isAutoInitEnabled)

    //     messaging().getToken().then(token => {
    //       console.log("token: ", token)
    //     })

    //     fcmUnsubscribe = messaging().onMessage(async remoteMessage => {
    //       console.warn("message when app opening...", remoteMessage)
    //     });

    //     messaging().onTokenRefresh(token => {
    //       console.log(token)
    //     })
    //   }
    // }).catch(err => {
    //   console.log(err)
    // })

    manageAsyncStorage().then(() => {
      analyzeInstalledData().then(toAsk => {
        if (toAsk) {
            OpenRating();
        }
      })
      getPhoneNumber().then(number => {
        savePhoneNumber(number, AUTO_GEN);
      });
      cleanCameraCache();
    })

    // return fcmUnsubscribe;
  }, [])

  return (
    <AppNavigation />
  );
}