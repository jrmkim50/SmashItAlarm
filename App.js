import React, { useEffect } from 'react';
import OpenRating from './app/components/general/OpenRating';
import { analyzeInstalledData } from './app/utils/analytics';
import AppNavigation from './app/navigation/AppNavigation';

export default function App() {
  
  useEffect(() => {
    analyzeInstalledData().then(toAsk => {
      if (toAsk) {
        OpenRating();
      }
    })
  }, [])
  
  return (
    <AppNavigation />
  );
}