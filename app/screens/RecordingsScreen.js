import React, { useState } from 'react';
import { View } from 'react-native'
import ActivityWindow from '../components/general/ActivityWindow';
import Recordings from '../components/RecordingsScreen/Recordings';
import { screenStyle } from '../utils/styles';

export default function RecordingsScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    return (
        <View style={screenStyle.container}>
            <Recordings setLoading={setLoading} setSuccess={setSuccess}/>
            {loading && <ActivityWindow loading={loading} success={success} message="Deleted!"/>}
        </View>
    )
}