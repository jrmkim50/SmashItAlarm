import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { FlatList, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import FlatListItem from './FlatListItem';
import { useIsFocused } from "@react-navigation/native";
import { sleep } from '../../utils/utils';

export default function Recordings({ setLoading, setSuccess }) {
    const [uris, setURIs] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const isFocused = useIsFocused();

    useEffect(() => {
        refreshData();
    }, [isFocused])

    const refreshData = () => {
        setRefreshing(true);
        AsyncStorage.getItem("recordings").then((recordings) => {
            recordings = JSON.parse(recordings);
            setURIs(recordings);
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
        let tempURIs = [...uris];
        tempURIs.splice(index, 1);
        setURIs(tempURIs);
        await sleep(500);
        setSuccess(true);
        await sleep(500);
        setLoading(false);
        setSuccess(false);
        try {
            await AsyncStorage.setItem("recordings", JSON.stringify(tempURIs))
        } catch(err) {
            console.log(err.message);
        }
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