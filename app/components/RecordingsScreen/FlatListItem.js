import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Video from 'react-native-video';
import HorizontalLine from '../general/HorizontalLine';
import { Metrics } from '../../themes';

export default function FlatListItem({ uri, type, aspect_ratio, index, deleteAt }) {

    const video = useRef(); 
    const [aspect, setAspect] = useState(aspect_ratio);
    const [paused, setPaused] = useState(true)
    let data = null;

    const togglePlay = () => {
        if (!video) {
            return;
        }
        setPaused(!paused);
    }

    const onLoad = (response) => {
        if (response && response.naturalSize && response.naturalSize.orientation === "portrait") {
            if (response.naturalSize.width > response.naturalSize.height) {
                setAspect(1/aspect_ratio); 
            }
        } else if (response && response.naturalSize && response.naturalSize.orientation === "landscape") {
            if (response.naturalSize.height > response.naturalSize.width) {
                setAspect(1/aspect_ratio); 
            }
        }
    }

    const share = async () => {
        try {
            await Share.share({ url: uri });
        } catch(err) {
            console.log(err.message)
        }
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
                       style={[styles.data, { aspectRatio: aspect }]}
                       onLoad={onLoad} repeat = {true} resizeMode='contain' paused={paused}
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
                <TouchableOpacity onPress={() => deleteAt(index)}>
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