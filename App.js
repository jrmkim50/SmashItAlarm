import React, { useEffect } from 'react';
import OpenRating from './app/components/general/OpenRating';
import { analyzeInstalledData } from './app/utils/analytics';
import AppNavigation from './app/navigation/AppNavigation';
import { getPhoneNumber, savePhoneNumber } from './app/utils/alarm';
import { AUTO_GEN, EMERGENCY_NUMBER } from './app/utils/constants';
import { clearAsyncStorageKey } from './app/utils/utils';

export default function App() {

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