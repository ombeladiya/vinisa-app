import React, { useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import StyledButton from '../components/StyledButton';
import { useRouter } from 'expo-router';

export default function requestAccess() {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const requestAccess = async () => {
        if (loading) return;
        try {
            if (!name.trim() || !mobile.trim() || !password.trim()) {
                Alert.alert('Validation Error', 'Please fill all fields');
                return;
            }

            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(mobile.trim())) {
                Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits');
                return;
            }

            setLoading(true);
            await axios.post('https://landmen.in/api/auth/request-access', { name, mobile, password });
            Alert.alert('Success', 'Access request submitted. Please wait for admin approval.');
            router.push('/');
        } catch (error) {
            Alert.alert('Error', 'Request failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
            <TextInput
                style={tw`border border-gray-600 rounded-full p-3 px-4 w-full max-w-md mb-4`}
                placeholder="Name"
                value={name}
                onChangeText={setName}
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

            {loading ? (
                <ActivityIndicator size="large" color="#643843" />
            ) : (
                <StyledButton onPress={requestAccess} title="Request To Admin" />
            )}
        </View>
    )
}


