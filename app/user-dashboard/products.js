import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, FlatList, Text, Image, TouchableOpacity, Alert, Modal, Animated, ActivityIndicator, Easing } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import Icon from 'react-native-vector-icons/Feather';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();

    const fetchProducts = async (page = 1, searchQuery = '') => {
        try {
            setIsLoading(true);
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
            setIsLoading(false);
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

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
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

    const handleQuantityChange = (productId, quantity) => {
        const numericQuantity = quantity.replace(/[^0-9]/g, '');
        setQuantities(prev => ({
            ...prev,
            [productId]: numericQuantity
        }));
    };

    const openAskRateModal = (product) => {
        setSelectedProduct(product);
        setIsModalVisible(true);
    };

    const askForRate = async () => {
        if (!selectedProduct) return;

        if (!note.trim()) {
            Alert.alert('Error', 'Please Enter Message.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post('https://landmen.in/api/chat/send-message', {
                image: selectedProduct.images[0],
                message: note,
                productId: selectedProduct._id,
                isSender: true
            }, { headers: { Authorization: token } });
            setIsModalVisible(false);
            router.push('user-dashboard/chat');
            setNote('');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const placeOrder = async (product) => {
        const quantity = quantities[product._id];

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid positive quantity to place the order.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post('https://landmen.in/api/orders/place-order', {
                productId: product._id,
                image: product.images[0],
                name: product.name,
                quantity: quantity
            }, { headers: { Authorization: token } });
            router.push('user-dashboard/chat');
        } catch (error) {
            Alert.alert('Error', 'Could not place order.');
        }
    };

    const navigateToProductDetails = (item) => {
        router.push({
            pathname: 'user-dashboard/product-details',
            params: { productData: JSON.stringify(item) }
        });
    };

    const truncateText = (text, limit) => {
        return text.length > limit ? text.substring(0, limit) + '...' : text;
    };

    return (
        <View style={tw`p-4 bg-gray-100 flex-1`}>
            <View style={tw`flex-row items-center bg-white rounded-full shadow-md px-4 py-2 mb-4`}>
                <Icon name="search" size={20} color="gray" />
                <TextInput
                    placeholder="Search Products..."
                    value={searchQuery}
                    onChangeText={handleSearchTextChange}
                    style={tw`flex-1 text-sm pl-2 p-1`}
                />
            </View>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={tw`mb-3 bg-white shadow-sm rounded-lg flex-row p-4 items-center`}
                        onPress={() => navigateToProductDetails(item)}
                    >
                        {item.images && item.images.length > 0 ? (
                            <Image
                                source={{ uri: item.images[0] }}
                                style={tw`w-28 h-28 rounded-lg`}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={tw`bg-gray-300 w-20 h-20 rounded-lg justify-center items-center`}>
                                <Text style={tw`text-gray-500`}>No Image</Text>
                            </View>
                        )}
                        <View style={tw`ml-4 flex-1`}>
                            {item.name && (
                                <Text style={tw`text-sm mb-1 font-bold text-gray-800`}>
                                    {truncateText(item.name, 35)}
                                </Text>
                            )}
                            {item.price && (
                                <Text style={[tw`font-semibold text-sm mb-1`, { color: '#643853' }]}>
                                    ₹{item.price}/{item.unit}
                                </Text>
                            )}
                            {item.status === 'CommingSoon' && (
                                <Text style={[tw`font-semibold text-sm mb-1 text-green-600`]}>
                                    Comming Soon
                                </Text>
                            )}
                            <View style={tw`relative w-2/3 mb-1.5`}>
                                <TextInput
                                    placeholder="Quantity"
                                    keyboardType="numeric"
                                    style={tw`border border-gray-600 text-xs rounded px-2 max-w-md`}
                                    value={quantities[item._id] ? String(quantities[item._id]) : ''}
                                    onChangeText={(quantity) => handleQuantityChange(item._id, quantity)}
                                />
                                <Text style={tw`absolute font-semibold right-2 top-1.5 text-xs text-gray-800`}>
                                    {item.unit}
                                </Text>
                            </View>

                            <View style={tw`flex-row justify-start items-center`}>
                                <TouchableOpacity
                                    style={[tw`p-2 rounded-md mr-2`, { backgroundColor: '#643853' }]}
                                    onPress={() => openAskRateModal(item)}
                                >
                                    <Text style={tw`text-white text-xs text-center`}>Ask Rate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[tw`p-2 rounded-md`, { backgroundColor: '#643853' }]}
                                    onPress={() => placeOrder(item)}
                                >
                                    <Text style={tw`text-white text-xs text-center`}>Place Order</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                initialNumToRender={10}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    hasMore ? <SkeletonLoader /> : <Text style={tw`text-center text-gray-500 my-4`}>No More Products</Text>
                }
            />

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-gray-900 bg-opacity-50`}>
                    <View style={tw`bg-white p-6 rounded-lg w-11/12`}>
                        <Text style={tw`text-lg font-semibold mb-4`}>Send Message</Text>
                        <TextInput
                            style={tw`border p-2 rounded w-full mb-4`}
                            placeholder="Enter Message Regarding Product"
                            multiline
                            numberOfLines={4}
                            value={note}
                            onChangeText={setNote}
                        />
                        <View style={tw`flex-row justify-end`}>
                            <TouchableOpacity
                                style={tw`bg-gray-200 p-2 px-6 mx-2 rounded`}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={tw`text-gray-900`}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[tw`p-2 px-6 rounded`, { backgroundColor: '#643853' }]}
                                onPress={askForRate}
                            >
                                <Text style={tw`text-white`}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
