import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Video from 'react-native-video';
import HorizontalLine from '../general/HorizontalLine';
import { Metrics } from '../../themes';

export default function FlatListItem({ uri, type, aspect_ratio, index, deleteAt }) {

    const video = useRef();
    // const [aspect, setAspect] = useState(aspect_ratio);
    const [paused, setPaused] = useState(true)
    let data = null;

    const togglePlay = () => {
        setPaused(!paused);
    }

    const onLoad = (response) => {
        // if (Platform.OS === "ios") {
        //     if (response && response.naturalSize && response.naturalSize.orientation === "portrait") {
        //         if (aspect_ratio > 1) {
        //             setAspect(1/aspect_ratio); 
        //         }
        //     }
        //     if (response && response.naturalSize && response.naturalSize.orientation === "landscape") {
        //         if (aspect_ratio < 1) {
        //             setAspect(1/aspect_ratio); 
        //         }
        //     }
        // }
        if (video && video.current) {
            video.current.seek(0);
        }
    }

    const share = async () => {
        try {
            await Share.share({ url: uri });
        } catch(err) {
            console.log(err.message)
        }
    }

    const deleteData = async () => {
        deleteAt(index);
    }

    if (type === "image") {
        data = (
            <TouchableOpacity activeOpacity={1} style={styles.dataContainer} onLongPress={share}>
                <Image source={{uri: uri}} 
                       style={[styles.data, { aspectRatio: aspect_ratio }]} resizeMode='contain'
                />
            </TouchableOpacity>
                      )
    } else if (type === "video") {
        data = (
            <TouchableOpacity onPress={togglePlay} style={styles.dataContainer} onLongPress={share}>
                <Video ref={video} source={{uri: uri}}
                       style={[styles.data, { aspectRatio: aspect_ratio }]}
                       onLoad={onLoad} repeat = {true} resizeMode='contain' paused={paused}
                       ignoreSilentSwitch = 'ignore'
                />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            {data}
            <View style={styles.actionBar}>
                <TouchableOpacity onPress={share}>
                    <Ionicons name="share-outline" size={Metrics.icons.medium} color="green"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteData}>
                    <Ionicons name="trash" size={Metrics.icons.medium} color="red"/>
                </TouchableOpacity>
            </View>
            <HorizontalLine/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        alignItems: 'center'
    },
    dataContainer: {
        flexDirection: 'row',
    },
    data: {
        height: undefined, 
        width: '95%',
        marginBottom: 10
    },
    actionBar: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
        width: '95%',
    }
})