import React, { useEffect, useState } from 'react';
import OpenRating from './app/components/general/OpenRating';
import { analyzeInstalledData } from './app/utils/analytics';
import AppNavigation from './app/navigation/AppNavigation';
import { getPhoneNumber, savePhoneNumber } from './app/utils/alarm';
import { AUTO_GEN, EMERGENCY_NUMBER, INSTALLED_OLD_DO_NOT_USE } from './app/utils/constants';
import { cleanCameraCache, cleanRecordings, clearAsyncStorage, logAsyncStorage, manageAsyncStorage, setAsyncStorageItem } from './app/utils/utils';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
// import messaging from '@react-native-firebase/messaging';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await manageAsyncStorage()
        const toAsk = await analyzeInstalledData();
        if (toAsk) {
          OpenRating();
        }
        await savePhoneNumber(getPhoneNumber(), AUTO_GEN);
        await cleanCameraCache();
      } catch (err) {

      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, [])

  const onReady = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady])

  return (
    appReady ? <AppNavigation onReady={onReady}/> : null
  );
}