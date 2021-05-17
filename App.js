import React, { useEffect } from 'react';
import OpenRating from './app/components/general/OpenRating';
import { analyzeInstalledData } from './app/utils/analytics';
import AppNavigation from './app/navigation/AppNavigation';
import { getPhoneNumber, savePhoneNumber } from './app/utils/alarm';
import { AUTO_GEN, EMERGENCY_NUMBER } from './app/utils/constants';
import { clearAsyncStorageKey } from './app/utils/utils';
// import { Notifications } from 'react-native-notifications';

export default function App() {

  // let localNotification = Notifications.postLocalNotification({
  //   body: "Local notification!",
  //   title: "Local Notification Title",
  //   sound: "chime.aiff",
  //   silent: false,
  //   category: "SOME_CATEGORY",
  //   userInfo: {}
  // });

  useEffect(() => {
    analyzeInstalledData().then(toAsk => {
      if (toAsk) {
        OpenRating();
      }
    })

    getPhoneNumber().then(number => {
      savePhoneNumber(number, AUTO_GEN);
    });
  }, [])

  return (
    <AppNavigation />
  );
}