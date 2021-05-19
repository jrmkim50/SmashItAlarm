import React, { useEffect } from 'react';
import OpenRating from './app/components/general/OpenRating';
import { analyzeInstalledData } from './app/utils/analytics';
import AppNavigation from './app/navigation/AppNavigation';
import { getPhoneNumber, savePhoneNumber } from './app/utils/alarm';
import { AUTO_GEN, EMERGENCY_NUMBER, INSTALLED_OLD_DO_NOT_USE } from './app/utils/constants';
import { clearAsyncStorage, logAsyncStorage, setAsyncStorageItem } from './app/utils/utils';

export default function App() {

  logAsyncStorage();
  // setAsyncStorageItem(INSTALLED_OLD_DO_NOT_USE, { installDate: 1621136883407, asked: true })
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