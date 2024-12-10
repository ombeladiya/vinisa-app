import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function Profile() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            router.replace('/');
        } catch (error) {
            alert('Failed to log out. Please try again.');
        }
    };

    const [profile, setProfile] = useState({
        name: '',
        mobile: '',
        JoinDate: '',
        imageUrl: 'https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-855.jpg',
    });
    const [loading, setLoading] = useState(true);

    const fetchProfileData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://landmen.in/api/auth/user-detail', {
                headers: { Authorization: token },
            });
            const data = response.data.user;
            setProfile({
                name: data.name || 'User Name',
                JoinDate: new Date(data.createdAt).toLocaleDateString('en-GB') || 'N/A',
                mobile: data.mobile || '+91 0000000000',
                imageUrl: 'https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-855.jpg',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    return (
        <View style={tw`flex-1 bg-gray-100 justify-center items-center p-4`}>
            {loading ? (
                <ActivityIndicator size="large" color="#643843" />
            ) : (
                <View style={tw`bg-white rounded-xl shadow-lg p-6 w-full max-w-sm`}>
                    <View style={tw`items-center`}>
                        <Image
                            source={{ uri: profile.imageUrl }}
                            style={tw`w-64 h-64 rounded-full mb-4 shadow-md`}
                        />
                        <Text style={tw`text-xl font-semibold text-gray-800`}>{profile.name}</Text>
                        <Text style={tw`text-gray-600 mt-1`}>Mobile: {profile.mobile}</Text>
                        <Text style={tw`text-gray-600 mt-1`}>JoinedAt: {profile.JoinDate}</Text>
                    </View>

                    <TouchableOpacity
                        style={tw`mt-6 bg-white p-3 border-[2px] border-red-600 rounded-full flex-row items-center justify-center`}
                        onPress={handleLogout}
                    >
                        <MaterialIcons name="logout" size={20} color="red" />
                        <Text style={tw`text-red-500 text-sm ml-2 font-medium`}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
