import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../themes'

export default function HorizontalLine() {
    return(
        <View style={styles.container}/>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomColor: Colors.black,
        borderBottomWidth: 1,
        width: '90%',
    }
})