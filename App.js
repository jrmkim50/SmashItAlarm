import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import openRating from './app/components/general/openRating';
import AppNavigation from './app/navigation/AppNavigation';

const elapsedToDays = (ms) => {
  return ms / (24 * 60 * 60 * 1000);
}

export default function App() {
  const defaultInstalled = { installDate: Date.now() };
  useEffect(() => {
    AsyncStorage.getItem("installed").then(installed => {
      if (!installed) {
        AsyncStorage.setItem("installed", JSON.stringify(defaultInstalled));
      } else {
        installed = JSON.parse(installed);
        AsyncStorage.getItem("recordings").then(recordings => {
          recordings = JSON.parse(recordings);
          if (recordings && recordings.length > 0 && (!installed.alarm || !installed.recording)) {
            installed.alarm = true;
            installed.recording = true;
            AsyncStorage.setItem("installed", JSON.stringify(installed))
          }
          if (!installed.asked && elapsedToDays(Date.now() - installed.installDate) >= 5 &&
              installed.alarm && installed.recording) {
            openRating();
          }
        })
      }
    })
  }, [])
  
  return (
    <AppNavigation />
  );
}