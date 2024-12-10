import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            router.replace('/');
        } catch (error) {
            alert('Failed to log out. Please try again.');
        }
    };

    const DashboardButton = ({ title, icon, onPress }) => (
        <TouchableOpacity
            style={tw`flex-row w-full items-center bg-white p-5 rounded-full mb-4`}
            onPress={onPress}
        >
            <Feather name={icon} size={24} color="#643843" />
            <Text style={tw`text-[#643843] text-[15px] font-semibold ml-4`}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#643852', '#99627A']} style={tw`flex-1 justify-between items-center`}>
            <StatusBar barStyle="light-content" backgroundColor="#643843" />

            <View style={tw`items-center mt-20`}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={tw`h-32 w-32 rounded-full`}
                    resizeMode="contain"
                />
                <View style={tw`mt-3`}>
                    <Text style={tw`text-2xl font-bold text-center text-white`}>
                        Vinisa Refrigeration
                    </Text>
                </View>
            </View>
            <ScrollView style={tw`w-full px-6 my-8`}>
                <DashboardButton
                    title="Manage Users"
                    icon="users"
                    onPress={() => router.push('/admin-dashboard/manage-user')}
                />
                <DashboardButton
                    title="Manage Products"
                    icon="package"
                    onPress={() => router.push('/admin-dashboard/manage-products')}
                />
                <DashboardButton
                    title="Create Product"
                    icon="plus-circle"
                    onPress={() => router.push('/admin-dashboard/create-product')}
                />
                <DashboardButton
                    title="Chat"
                    icon="message-circle"
                    onPress={() => router.push('/admin-dashboard/users')}
                />
                <TouchableOpacity
                    style={tw`bg-white rounded-full mt-8 py-4 px-6 items-center flex-row justify-center`}
                    onPress={handleLogout}
                >
                    <Feather name="log-out" size={24} color="#E94F4F" style={tw`mr-2`} />
                    <Text style={tw`text-[#E94F4F] text-[14px] font-semibold`}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}