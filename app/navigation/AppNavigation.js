import React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons';
import { Metrics } from '../themes';
import HomeStackComponent from './HomeStackComponent';
import RecordingsStackComponent from './RecordingsStackComponent';
import SettingsScreen from '../screens/SettingsScreen';

const TabNav = createBottomTabNavigator();
const TAB_NAMES = {
    "home": "HomeTab",
    "settings": "SettingsTab",
    "recordings": "RecordingsTab"
}

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <TabNav.Navigator
                initialRouteName={TAB_NAMES.home}
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === TAB_NAMES.home) {
                            iconName = "home";
                        } else if (route.name === TAB_NAMES.settings) {
                            iconName = "settings";
                        } else if (route.name === TAB_NAMES.recordings) {
                            iconName = "albums-outline";
                        }
                        return <Ionicons name={iconName} size={Metrics.icons.medium} color={color}/>
                    }
                })}
                tabBarOptions={{
                    activeTintColor: 'rgb(106,183,205)',
                    showLabel: false
                }}
            >
                <TabNav.Screen name={TAB_NAMES.home} component={HomeStackComponent}/>
                <TabNav.Screen name={TAB_NAMES.recordings} component={RecordingsStackComponent}/>
                <TabNav.Screen name={TAB_NAMES.settings} component={SettingsScreen}/>
            </TabNav.Navigator>
        </NavigationContainer>
    )
}