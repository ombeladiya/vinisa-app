import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import _ from 'lodash'; // Lodash for debouncing
import Icon from 'react-native-vector-icons/Feather';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const colors = [
        'bg-blue-400', 'bg-red-400', 'bg-green-600', 'bg-indigo-500',
        'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-gray-400'
    ];
    function formatUpdatedAtDate(updatedAt) {
        const date = new Date(updatedAt);
        const now = new Date();

        const isSameDay = date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isSameDay) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-GB');
        }
    }

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://landmen.in/api/auth/users-chat', {
                headers: { Authorization: token }
            });
            setUsers(response.data.users);
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const debouncedSearch = useCallback(_.debounce((query) => setSearchQuery(query), 300), []);

    const startChat = (user) => {
        router.push({
            pathname: '/admin-dashboard/enquiry',
            params: {
                userId: user._id,
                userName: user.name,
                userMobile: user.mobile,
            },
        });
    };

    const getRandomColor = useCallback(() => {
        return colors[Math.floor(Math.random() * colors.length)];
    }, [colors]);

    const renderItem = useCallback(({ item }) => (
        <TouchableOpacity
            onPress={() => startChat(item)}
            style={tw`flex-row items-center p-3 bg-white border-b border-gray-200`}
        >
            <View style={tw`w-12 h-12 rounded-full flex items-center justify-center ${getRandomColor()}`}>
                <Text style={tw`text-lg font-bold text-white`}>{item.name[0]}</Text>
            </View>
            <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-lg font-bold text-gray-800`}>{item.name}</Text>
                <Text style={tw`text-sm text-gray-600`}>{formatUpdatedAtDate(item.updatedAt)}</Text>
            </View>
            {item.unRead > 0 && (
                <View style={[tw`rounded-full w-6 h-6 items-center justify-center`, { backgroundColor: '#643853' }]}>
                    <Text style={tw`text-white text-xs`}>{item.unRead}</Text>
                </View>
            )}
        </TouchableOpacity>
    ), [getRandomColor]);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(user.mobile).includes(searchQuery)
    );

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <View style={tw`p-2`}>
                <View style={tw`flex-row items-center bg-white rounded-full shadow-sm px-4 py-2`}>
                    <Icon name="search" size={20} color="gray" />
                    <TextInput
                        placeholder="Search by name or mobile"
                        onChangeText={debouncedSearch}
                        style={tw`flex-1 text-sm pl-2 p-1`}
                    />
                </View>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#643843" style={tw`flex-1 justify-center`} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={renderItem}
                    onRefresh={fetchUsers}
                    refreshing={loading}
                />
            )}
        </View>
    );
}
