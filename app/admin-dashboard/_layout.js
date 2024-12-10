import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Define primary and secondary colors for the gradient
const PRIMARY_COLOR = '#643852';
const SECONDARY_COLOR = '#643850';

// Custom gradient header background component
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
        <Stack>
            <Stack.Screen name="index" options={{
                headerShown: false
            }} />
            <Stack.Screen
                name="manage-products"
                options={{
                    title: 'Manage Product',
                    headerBackground: () => <GradientHeader />,
                    ...commonHeaderStyle,
                }}
            />

            <Stack.Screen
                name="create-product"
                options={{
                    title: 'Create Product',
                    headerBackground: () => <GradientHeader />,
                    ...commonHeaderStyle,
                }}
            />

            <Stack.Screen
                name="edit-product"
                options={{
                    title: 'Edit Product',
                    headerBackground: () => <GradientHeader />,
                    ...commonHeaderStyle,
                }}
            />

            <Stack.Screen
                name="manage-user"
                options={{
                    title: 'Users',
                    headerBackground: () => <GradientHeader />,
                    ...commonHeaderStyle,
                }}
            />

            <Stack.Screen
                name="users"
                options={{
                    title: 'Chats',
                    headerBackground: () => <GradientHeader />,
                    ...commonHeaderStyle,
                }}
            />
            <Stack.Screen name="enquiry" options={{ headerShown: false }} />
        </Stack>
    );
}

// Common styles for all headers
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
};

