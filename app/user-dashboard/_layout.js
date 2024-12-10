import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY_COLOR = '#643853';
const SECONDARY_COLOR = '#643850';

// Custom header background component
const GradientHeader = () => (
    <LinearGradient
        colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
    />
);

export default function RootLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false
                    }}
                />

                <Stack.Screen
                    name="product-details"
                    options={{
                        title: 'Product Details',
                        headerBackground: () => <GradientHeader />,
                        ...commonHeaderStyle,
                    }}
                />

                <Stack.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        headerBackground: () => <GradientHeader />,
                        ...commonHeaderStyle,
                    }}
                />

                <Stack.Screen
                    name="products"
                    options={{
                        title: 'Products',
                        headerBackground: () => <GradientHeader />,
                        ...commonHeaderStyle,
                    }}
                />

                <Stack.Screen
                    name="chat"
                    options={{
                        title: 'VINISA REFRIGERATION',
                        headerBackground: () => <GradientHeader />,
                        ...commonHeaderStyle,
                    }}
                />
            </Stack>
        </>
    );
}

const commonHeaderStyle = {
    headerStyle: {
        height: Platform.OS === 'ios' ? 110 : 80,
    },
    headerTitleStyle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerTintColor: '#ffffff',
    headerTitleAlign: 'center',
    headerShadowVisible: true,
    statusBarStyle: 'light',
    statusBarColor: '#643853'
};