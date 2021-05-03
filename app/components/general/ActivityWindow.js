import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Metrics } from '../../themes';
import { Colors } from '../../themes';

export default function ActivityWindow({ loading, success, message }) {
    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.cloud,
            zIndex: 10,
            elevation: 10,
        },
        activity: {
            width: 200,
            height: 200,
            backgroundColor: 'beige',      
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            opacity: 1
        },
        text: {
            fontSize: 18,
            fontWeight: 'bold'
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.activity}>
                {(!success && loading) && <ActivityIndicator size="large" color="#0000ff"/>}
                {success && <Ionicons name="checkmark" size={Metrics.icons.large} color="green"/>}
                {(success && message) && <Text style={styles.text}>{message}</Text>}
            </View>
        </View>
    )
}