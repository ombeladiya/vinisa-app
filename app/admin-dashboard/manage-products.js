import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Animated, Easing, Alert } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import Icon from 'react-native-vector-icons/Feather';

const ProductItem = React.memo(({ item, router, onEdit, onDelete }) => (
    <TouchableOpacity
        style={tw`flex-row bg-white rounded-lg p-4 my-1 border border-gray-200`}
        onPress={() =>
            router.push({
                pathname: '/user-dashboard/product-details',
                params: { productData: JSON.stringify(item) },
            })
        }
    >
        <View style={tw`w-20 h-20 rounded-lg overflow-hidden bg-gray-200 mr-4 justify-center items-center`}>
            {item.images && item.images.length > 0 ? (
                <Image source={{ uri: item.images[0] }} style={tw`w-full h-full rounded-lg`} />
            ) : (
                <Text style={tw`text-gray-500`}>No Image</Text>
            )}
        </View>
        <View style={tw`flex-1`}>
            <Text style={tw`text-sm font-semibold text-gray-800 mb-1`}>{item.name}</Text>
            {item.price && <Text style={tw`text-sm text-gray-600 mb-2`}>₹{item.price}</Text>}
            {item.status === 'CommingSoon' && <Text style={tw`text-sm text-green-600 mb-2`}>{item.status}</Text>}
            <View style={tw`flex-row`}>
                <TouchableOpacity style={tw`bg-gray-100 rounded p-2 mr-2`} onPress={() => onEdit(item)}>
                    <Text style={tw`text-[10px] text-black`}>
                        <Icon name="edit" size={16} color="green" />
                        Edit
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-gray-100 rounded p-2`} onPress={() => onDelete(item._id)}>
                    <Text style={tw`text-[10px] text-black`}>
                        <Icon name="trash" size={16} color="red" />
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    </TouchableOpacity>
));

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();

    const fetchProducts = async (page = 1, searchQuery = '') => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get('https://landmen.in/api/products', {
                headers: { Authorization: token },
                params: {
                    page,
                    search: searchQuery,
                },
            });

            const newProducts = res.data.products;
            if (newProducts.length === 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (page === 1) {
                setProducts(newProducts);
            } else {
                setProducts((prevProducts) => {
                    const uniqueProducts = newProducts.filter(
                        (newProduct) => !prevProducts.some((product) => product._id === newProduct._id)
                    );
                    return [...prevProducts, ...uniqueProducts];
                });
            }
        } catch (error) {
            alert('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(1, searchQuery);
    }, []);

    const debouncedSearch = useMemo(
        () =>
            debounce((query) => {
                fetchProducts(1, query); // Fetch products with the new search query
            }, 300),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearchTextChange = (text) => {
        setSearchQuery(text); // Update the input field immediately
        debouncedSearch(text); // Call the debounced API function
    };

    const confirmDeleteProduct = (productId) => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => deleteProduct(productId) }
            ],
            { cancelable: true }
        );
    };

    const deleteProduct = async (productId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`https://landmen.in/api/products/${productId}`, {
                headers: { Authorization: token },
            });
            Alert.alert('Success', 'Product Deleted Successfully');
            setProducts(products.filter((product) => product._id !== productId));
        } catch (error) {
            Alert.alert('Error', `Error deleting product: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage((prevPage) => {
                const nextPage = prevPage + 1;
                fetchProducts(nextPage, searchQuery);
                return nextPage;
            });
        }
    };

    const SkeletonLoader = () => {
        const fadeAnim = useState(new Animated.Value(0))[0];

        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(fadeAnim, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        }, []);

        return Array.from({ length: 3 }).map((_, index) => (
            <Animated.View
                key={index}
                style={[tw`flex-row bg-white rounded-lg p-4 my-1 border border-gray-200`, { opacity: fadeAnim }]}
            >
                <View style={tw`w-20 h-20 bg-gray-200 rounded-lg`} />
                <View style={tw`flex-1 ml-4`}>
                    <View style={tw`h-4 bg-gray-200 mb-2`} />
                    <View style={tw`h-4 bg-gray-200 mb-2`} />
                    <View style={tw`flex-row`}>
                        <View style={tw`h-4 bg-gray-200 w-1/4 mr-2`} />
                        <View style={tw`h-4 bg-gray-200 w-1/4`} />
                    </View>
                </View>
            </Animated.View>
        ));
    };

    return (
        <View style={tw`flex-1 p-4 bg-gray-50`}>
            <View style={tw`flex-row items-center bg-white rounded-full shadow-md px-4 py-2 mb-4`}>
                <Icon name="search" size={20} color="gray" />
                <TextInput
                    placeholder="Search Products..."
                    value={searchQuery}
                    onChangeText={handleSearchTextChange}
                    style={tw`flex-1 text-sm pl-2 p-1`}
                />
            </View>
            {loading && page === 1 ? (
                <ActivityIndicator size="large" color="#643843" style={tw`mt-4`} />
            ) : (
                <FlatList
                    data={products}
                    renderItem={({ item }) => (
                        <ProductItem
                            item={item}
                            router={router}
                            onEdit={(product) =>
                                router.push({
                                    pathname: '/admin-dashboard/edit-product',
                                    params: { productData: JSON.stringify(product) },
                                })
                            }
                            onDelete={confirmDeleteProduct}
                        />
                    )}
                    keyExtractor={(item) => item._id.toString()}
                    initialNumToRender={10}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        hasMore ? <SkeletonLoader /> : <Text style={tw`text-center text-gray-500 my-4`}>No More Products</Text>
                    }
                />
            )}
        </View>
    );
}
