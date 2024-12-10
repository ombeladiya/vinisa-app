import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import UserTable from '../../components/UserTable';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManageUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Fetch the token once
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                setToken(storedToken);
            } catch (error) {
                Alert.alert('Error', 'Failed to retrieve token');
            }
        };

        fetchToken();
    }, []);

    useEffect(() => {
        if (token) {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get('https://landmen.in/api/auth/users', {
                        headers: { Authorization: token },
                    });
                    setUsers(response.data.users);
                } catch (error) {
                    Alert.alert('Error', 'Failed to fetch users');
                } finally {
                    setLoading(false);
                }
            };

            // Adding slight delay to avoid performance hiccups on load
            setTimeout(fetchUsers, 500);
        }
    }, [token]);

    // Memoized handler to verify user
    const handleVerify = useCallback(async (userId) => {
        Alert.alert(
            'Confirm Verification',
            'Are you sure you want to verify this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Verify',
                    onPress: async () => {
                        try {
                            await axios.put(
                                `https://landmen.in/api/auth/approve-user/${userId}`,
                                {},
                                { headers: { Authorization: token } }
                            );
                            setUsers(prevUsers =>
                                prevUsers.map(user =>
                                    user._id === userId ? { ...user, approved: true } : user
                                )
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to verify user');
                        }
                    },
                },
            ]
        );
    }, [token]);

    // Memoized handler to delete user
    const handleDelete = useCallback(async (userId) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await axios.delete(`https://landmen.in/api/auth/users/${userId}`, {
                                headers: { Authorization: token },
                            });
                            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    }, [token]);

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
                <ActivityIndicator size="large" color="#643843" />
            </View>
        );
    }

    return (
        <View style={tw`flex-1 p-4 bg-white pb-20`}>
            <UserTable users={users} onVerify={handleVerify} onDelete={handleDelete} />
        </View>
    );
}
