import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import Swiper from 'react-native-swiper';
import tw from 'twrnc';

export default function ProductDetails() {
    const { productData } = useLocalSearchParams();
    const product = JSON.parse(productData);

    return (
        <View style={tw`flex-1 bg-white`}>
            <View style={tw`h-[60%]`}>
                <Swiper
                    style={tw`h-full`}
                    showsPagination={true}
                    autoplay={true}
                    paginationStyle={styles.paginationStyle}
                    dotStyle={styles.dotStyle}
                    activeDotStyle={styles.activeDotStyle}
                >
                    {product.images.length > 0 ? (
                        product.images.map((image, index) => (
                            <View key={index} style={tw`w-full h-full`}>
                                <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
                            </View>
                        ))
                    ) : (
                        <View style={tw`bg-gray-300 h-full justify-center items-center`}>
                            <Text style={tw`text-gray-500 text-lg`}>No Images Available</Text>
                        </View>
                    )}
                </Swiper>
            </View>
            <ScrollView
                style={[
                    tw`h-[40%] p-6 bg-white shadow-lg`,
                    { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
                ]}
            >
                <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>{product.name}</Text>
                {product.description && (
                    <Text style={tw`text-lg text-gray-700 mb-4`}>{product.description}</Text>
                )}
                {product.status && (
                    <Text style={tw`text-lg text-green-600 mb-4`}>{product.status}</Text>
                )}
                {product.price && (
                    <Text style={[tw`text-2xl font-semibold`, { color: '#643843' }]}>
                        ₹{product.price}/{product.unit}
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    paginationStyle: {
        bottom: 20,
    },
    dotStyle: {
        backgroundColor: 'rgba(0, 0, 0, .3)',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    activeDotStyle: {
        backgroundColor: '#643843',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    image: {
        width: '100%',
        height: '100%',
    },
});