import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { JSON_BIN } from '../../config';
import { sleep } from '../../utils/utils';

export default function Feedback({ setLoading }) {
    const [feedBack, setFeedBack] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const submit = () => {
        if (feedBack && feedBack !== "") {
            setLoading(true);
            fetch("https://api.jsonbin.io/b", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "secret-key": JSON_BIN,
                    "private": true
                },
                body: JSON.stringify({
                    message: feedBack,
                    time: Date.now(),
                    viewed: false
                })
            }).then(response => {
                return response.json();
            }).then(async (json) => {
                await sleep(500);
                setLoading(false);
                if (json.success) {
                    setSuccess(true);
                    setFeedBack("");
                    setError(null);
                    sleep(1000).then(() => {
                        setSuccess(false);
                    })
                }
            }).catch(err => {
                setError(err.message)
            })
        } else {
            setError("Please enter feedback first.")
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Any feedback?</Text>
            <View style={styles.textInput}>
                <TextInput placeholder="Enter feedback here"
                           maxLength={200} onChangeText={setFeedBack} value={feedBack} placeholderTextColor="gray"/>
            </View>
            <Button title="Submit" onPress={submit}/>
            {error && <Text style={styles.error}>{error}</Text>}
            {success && <Text style={styles.success}>Uploaded!</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        padding: 10,
        width: '100%',
    },
    title: {
        fontSize: 18,
        fontStyle: 'italic'
    },
    textInput: {
        marginVertical: 10,
        borderBottomWidth: 1,
        paddingVertical: 10
    },
    error: {
        marginTop: 5,
        color: 'red'
    },
    success: {
        marginTop: 5,
        color: 'green'
    }
})