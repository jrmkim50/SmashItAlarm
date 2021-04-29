import React from 'react';
import { createStackNavigator } from '@react-navigation/stack'
import { RECORDINGS_STACK } from '../utils/constants';
import RecordingsScreen from '../screens/RecordingsScreen';

const RecordingsStack = createStackNavigator();

export default function RecordingsStackComponent() {
    return (
        <RecordingsStack.Navigator headerMode="float">
            <RecordingsStack.Screen name={RECORDINGS_STACK} component={RecordingsScreen}/>
        </RecordingsStack.Navigator>
    )
}