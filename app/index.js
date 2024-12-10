import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Image, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import StyledButton from '../components/StyledButton';

import { useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

function handleRegistrationError(errorMessage) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            handleRegistrationError('Permission not granted to get push token for push notification!');
            return;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            handleRegistrationError('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(pushTokenString);
            return pushTokenString;
        } catch (e) {
            handleRegistrationError(`${e}`);
        }
    } else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}

export default function Login() {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    const router = useRouter();

    const [expoPushToken, setExpoPushToken] = useState('');
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => setExpoPushToken(token ?? ''))
            .catch((error) => console.log(error));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        await AsyncStorage.removeItem('token');
                        router.replace('/');
                    } else {
                        // Navigate based on user role after layout is fully mounted
                        router.replace(decodedToken.isAdmin ? '/admin-dashboard' : '/user-dashboard');
                    }
                }
            } catch (error) {
                router.replace('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#643843" />
            </View>
        );
    }

    const handleLogin = async () => {
        setLoginLoading(true);
        try {
            if (!mobile.trim() || !password.trim()) {
                Alert.alert('Validation Error', 'Please fill all fields');
                setLoginLoading(false);
                return;
            }

            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(mobile.trim())) {
                Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits');
                setLoginLoading(false);
                return;
            }

            const res = await axios.post('https://landmen.in/api/auth/login', { mobile, password, expoPushToken });
            const token = res.data.token;
            const decodedToken = jwtDecode(token);
            await AsyncStorage.setItem('token', token);

            router.replace(decodedToken.isAdmin ? '/admin-dashboard' : '/user-dashboard');
        } catch (error) {
            Alert.alert('Login Error', 'Invalid mobile or password or approve pending');
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <View style={tw`flex-1 bg-white justify-center items-center p-4`}>
            <Image
                source={require('../assets/images/logo.png')}
                style={tw`w-35 h-35 mb-6`}
                resizeMode="contain"
            />
            <TextInput
                style={tw`border border-gray-600 rounded-full p-3 px-4 w-full max-w-md mb-4`}
                placeholder="Mobile"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
            />
            <TextInput
                style={tw`border border-gray-600 rounded-full p-3 px-4 w-full max-w-md mb-4`}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {loginLoading ? (
                <ActivityIndicator size="large" color="#643843" />
            ) : (
                <StyledButton onPress={handleLogin} title="Login" />
            )}

            <Text onPress={() => router.push('/request-access')} style={[tw`mt-4`, { color: '#643843' }]}>
                Request Access →
            </Text>
        </View>
    );
}