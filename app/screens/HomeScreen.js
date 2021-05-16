import React, { useState } from 'react';
import { View } from 'react-native'
import ActivityWindow from '../components/general/ActivityWindow';
import Alarm from '../components/HomeScreen/Alarm';
import { screenStyle } from '../utils/styles';

export default function HomeScreen() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    return (
        <View style={screenStyle.container}>
            <Alarm setLoading={setLoading} setSuccess = {setSuccess}/>
            {loading && <ActivityWindow loading={loading} success={success} message="Saved!"/>}
        </View>
    )
}