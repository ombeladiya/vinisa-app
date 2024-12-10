import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';

const StyledButton = ({ onPress, title }) => {
    return (
        <View style={tw`flex justify-center w-full items-center max-w-md`}>
            <LinearGradient
                colors={['#643853', '#99627A']}
                style={tw`w-full p-2 rounded-full`}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <TouchableOpacity
                    style={tw`w-full flex py-2 rounded-full`}
                    onPress={onPress}
                >
                    <Text style={tw`text-white text-sm text-center`}>{title}</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

export default StyledButton;
