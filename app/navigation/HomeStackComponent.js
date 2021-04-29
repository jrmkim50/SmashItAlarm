import React from 'react';
import { createStackNavigator } from '@react-navigation/stack'
import { HOME_STACK } from '../utils/constants';
import HomeScreen from '../screens/HomeScreen';

const HomeStack = createStackNavigator();

export default function HomeStackComponent() {
    return (
        <HomeStack.Navigator headerMode="float">
            <HomeStack.Screen name={HOME_STACK} component={HomeScreen}/> 
        </HomeStack.Navigator>
    )
}