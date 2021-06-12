import React from 'react';
import { View } from 'react-native'
import Alarm from '../components/HomeScreen/Alarm';
// Using style to fill the whole screen and center align vertically
import { screenStyle } from '../utils/styles';

export default function HomeScreen() {
    return (
        <View style={screenStyle.container}>
            <Alarm/>
        </View>
    )
}