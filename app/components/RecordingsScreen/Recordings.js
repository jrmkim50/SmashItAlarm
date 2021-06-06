import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { FlatList, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import FlatListItem from './FlatListItem';
import { useIsFocused } from "@react-navigation/native";
import { deleteFile, getAsyncStorageItem, logAsyncStorage, setAsyncStorageItem, sleep } from '../../utils/utils';
import { RECORDINGS } from '../../utils/constants';
import RNFS from 'react-native-fs';

export default function Recordings({ setLoading, setSuccess }) {
    const [fileNames, setFileNames] = useState(null);
    const [uris, setURIs] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const isFocused = useIsFocused();

    useEffect(() => {
        refreshData();
    }, [isFocused])

    const refreshData = () => {
        setRefreshing(true);
        getAsyncStorageItem(RECORDINGS).then((recordings) => {
            let temp_uris = JSON.parse(JSON.stringify(recordings));
            if (recordings) {
                temp_uris =  recordings.map(recording => {
                    return {...recording, uri: `${RNFS.DocumentDirectoryPath}/Camera/${recording.uri}`};
                })
            }
            setFileNames(recordings);
            setURIs(temp_uris);
            setRefreshing(false);
        }).catch(err => {
            console.log(err.message);
        })
    }

    const deleteAt = async (index) => {
        Alert.alert("Are you sure you want to delete?", "Press Ok to delete.",
                    [
                        { text: "cancel", style: 'cancel' },
                        { text: "Ok", onPress: () => confirmDeletion(index) }
                    ]);
    }

    const confirmDeletion = async (index) => {
        setLoading(true);
        let tempURIs = JSON.parse(JSON.stringify(uris));
        let tempFileNames = JSON.parse(JSON.stringify(fileNames));
        let uri = tempURIs[index].uri;
        const filePath = uri.split('///').pop()
        tempURIs.splice(index, 1);
        tempFileNames.splice(index, 1);
        try {
            await deleteFile(filePath)
            await setAsyncStorageItem(RECORDINGS, tempFileNames);
            await logAsyncStorage()
        } catch(err) {
            console.log(err.message);
        }
        setURIs(tempURIs);
        setFileNames(tempFileNames);
        await sleep(500);
        setSuccess(true);
        await sleep(500);
        setLoading(false);
        setSuccess(false);
    }

    const renderItem = ({ item, index }) => {
        return <FlatListItem uri={item.uri} type={item.type} 
                             aspect_ratio={item.aspect_ratio} 
                             index = {index} deleteAt = {deleteAt}/>;
    }

    return (
        <FlatList style={{ margin: 10, width: '95%' }} 
                  data={uris} 
                  renderItem={renderItem} 
                  keyExtractor = {(item) => item.uri}
                  refreshing={refreshing}
                  onRefresh={refreshData}
        >

        </FlatList>
    )
}