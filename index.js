import React from 'react';
import { registerRootComponent } from 'expo';
// import messaging from '@react-native-firebase/messaging';
import App from './App';

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//     console.log('Message handled in the background!', remoteMessage);
// })

// const ManagedApp = ({ isHeadless }) => {
//     if (isHeadless) {
//         console.log("Headless mode")
//         return null;
//     }
//     return <App/>
// }

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);