import React, { useEffect } from 'react';
import OpenRating from './app/components/general/OpenRating';
import { analyzeInstalledData } from './app/utils/analytics';
import AppNavigation from './app/navigation/AppNavigation';
import { getPhoneNumber, savePhoneNumber } from './app/utils/alarm';
import { AUTO_GEN, EMERGENCY_NUMBER, INSTALLED_OLD_DO_NOT_USE } from './app/utils/constants';
import { cleanCameraCache, cleanRecordings, clearAsyncStorage, logAsyncStorage, manageAsyncStorage, setAsyncStorageItem } from './app/utils/utils';
// import messaging from '@react-native-firebase/messaging';

export default function App() {
  useEffect(() => {
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
  }, [])

  return (
    <AppNavigation />
  );
}