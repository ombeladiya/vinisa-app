import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
    const router = useRouter();
    const [greeting, setGreeting] = useState('');
    const [quote, setQuote] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const quotes = [
            "Stay cool, we've got you covered!",
            "Chilling solutions for a warming world",
            "Keep your cool with Vinisa",
            "Bringing freshness to your world",
            "Innovation that's refreshingly cool"
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <LinearGradient
            colors={['#643853', '#99627A']}
            style={tw`flex-1 justify-between items-center`}
        >
            <View style={tw`items-center mt-20`}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={tw`h-32 w-32 rounded-full`}
                    resizeMode="contain"
                />
                <View style={tw`mt-6`}>
                    <Text style={tw`text-3xl font-bold text-center text-white`}>
                        {greeting}
                    </Text>
                    <Text style={tw`text-xl font-semibold text-center text-white mt-2`}>
                        Vinisa Refrigeration
                    </Text>
                    <Text style={tw`text-sm text-center text-gray-200 mt-4 italic`}>
                        "{quote}"
                    </Text>
                </View>
            </View>

            <View style={tw`w-full px-6 mb-12`}>
                <TouchableOpacity
                    style={tw`flex-row items-center bg-white p-5 rounded-full mb-4`}
                    onPress={() => router.push('/user-dashboard/products')}
                >
                    <Feather name="shopping-bag" size={24} color="#643843" />
                    <Text style={tw`text-[#643843] text-[15px] font-semibold ml-4`}>Our Products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={tw`flex-row items-center bg-white p-5 rounded-full mb-4`}
                    onPress={() => router.push('/user-dashboard/chat')}
                >
                    <Feather name="message-circle" size={24} color="#643843" />
                    <Text style={tw`text-[#643843] text-[15px] font-semibold ml-4`}>Chat with Us</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={tw`flex-row items-center bg-white p-5 rounded-full`}
                    onPress={() => router.push('/user-dashboard/profile')}
                >
                    <Feather name="user" size={24} color="#643843" />
                    <Text style={tw`text-[#643843] text-[15px] font-semibold ml-4`}>Your Profile</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}