import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Image, Pressable, Animated, Easing, Linking, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';

export default function enquiry() {
    const { userId, userName, userMobile } = useLocalSearchParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [products, setProducts] = useState([]);
    const flatListRef = useRef(null);
    const router = useRouter();
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalVisible2, setIsModalVisible2] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Function to handle long press
    const handleLongPress = (message) => {
        setSelectedMessage(message);
        setIsModalVisible2(true);
    };

    const closeModal = () => {
        setIsModalVisible2(false);
        setSelectedMessage(null);
    };

    const deleteMessage = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await axios.delete(`https://landmen.in/api/chat/messages/${selectedMessage._id}`, {
                headers: { Authorization: token },
            });
            fetchMessages();
        } catch (error) {
            alert('Could not Delete message.');
        } finally {
            setLoading(false);
        }
    }
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`https://landmen.in/api/chat/messages/${userId}`, {
                headers: { Authorization: token },
            });
            setMessages(res.data.reverse());
        } catch (error) {
            Alert.alert('Error', 'Could not fetch messages.');
        } finally {
            setLoading(false);
        }
    };

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
            console.log(error)
            alert('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };
    const sendMessage = async () => {
        if (newMessage.trim() === '') return;

        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post('https://landmen.in/api/chat/send-message-admin',
                {
                    user: userId,
                    message: newMessage,
                    isSender: false
                },
                {
                    headers: { Authorization: token },
                }
            );
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            Alert.alert('Error', 'Could not send message.');
        }
    };

    const shareProduct = async (product) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post('https://landmen.in/api/chat/send-message-admin', {
                image: product.images[0],
                message: product.name,
                productId: product._id,
                isSender: false,
                user: userId
            }, { headers: { Authorization: token } });
            fetchMessages()
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const navigateToProductDetail = async (productId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`https://landmen.in/api/products/${productId}`, {
                headers: { Authorization: token },
            });

            const product = response.data;

            if (product) {
                router.push({
                    pathname: 'user-dashboard/product-details',
                    params: { productData: JSON.stringify(product) },
                });
            } else {
                Alert.alert('Error', 'Product not found.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not fetch product details.');
        }
    };


    useEffect(() => {
        fetchMessages();
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

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        return messages.reduce((acc, message) => {
            const messageDate = formatDate(message.createdAt);
            if (!acc[messageDate]) {
                acc[messageDate] = [];
            }
            acc[messageDate].unshift(message);
            return acc;
        }, {});
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
                style={[tw`flex-row bg-white rounded-lg p-2 my-1 border border-gray-200`, { opacity: fadeAnim }]}
            >
                <View style={tw`w-16 h-16 bg-gray-200 rounded-lg`} />
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

    const renderItem = ({ item, index }) => {
        const groupedMessages = groupMessagesByDate(messages);
        const dates = Object.keys(groupedMessages);
        const currentDate = dates[index];
        const messagesForDate = groupedMessages[currentDate];

        return (
            <View>
                <View style={tw`flex items-center my-2`}>
                    <Text style={tw`text-gray-500 text-xs bg-gray-200 px-3 py-1 rounded-full`}>{currentDate}</Text>
                </View>

                {messagesForDate.map((item, msgIndex) => (
                    <Pressable
                        key={msgIndex}
                        onPress={() => item.productId ? navigateToProductDetail(item.productId) : null}
                        onLongPress={() => !item.isSender && handleLongPress(item)}
                        style={tw`mb-2 p-3 rounded-2xl max-w-4/5 ${!item.isSender ? 'bg-[#643853] self-end' : 'bg-gray-200 self-start'}`}
                    >
                        {item.image && !item.quantity && (
                            <Image
                                source={{ uri: item.image }}
                                style={tw`w-60 h-60 rounded-lg mb-2`}
                                resizeMode="cover"
                            />
                        )}
                        {item.image && item.quantity && (
                            <View style={tw`flex-row w-full border-l-4 border-black rounded-lg overflow-hidden`}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={tw`w-20 h-20`}
                                    resizeMode='cover'
                                />
                                <View style={tw`p-2 flex-1 justify-center`}>
                                    <Text style={tw`text-sm font-bold flex-shrink flex-wrap`}>
                                        {item.name}
                                    </Text>
                                    <Text style={tw`text-xs text-gray-600 mt-1`}>
                                        Quantity: {item.quantity}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {item.message && (
                            <Text style={[tw`text-sm`, !item.isSender ? tw`text-white` : tw`text-black`]}>
                                {item.message}
                            </Text>
                        )}
                        <View style={tw`flex flex-row justify-between items-center mt-1`}>
                            <Text style={[tw`text-xs`, !item.isSender ? tw`text-gray-300` : tw`text-gray-600`]}>
                                {formatTime(item.createdAt)}
                            </Text>
                            {item.quantity && (
                                <Ionicons name="checkmark-done-circle" size={20} color={!item.isSender ? "white" : "green"} />
                            )}
                        </View>
                    </Pressable>
                ))}
                <Modal
                    transparent={true}
                    visible={isModalVisible2}
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tw`bg-white rounded-t-3xl p-6`}>
                            <Text style={tw`text-[16px] font-bold mb-4 text-[#643853]`}>Delete Message</Text>
                            <Text style={tw`text-[14px] mb-4 text-gray-600`}>
                                Are you sure you want to delete this message?
                            </Text>
                            <View style={tw`flex-row justify-end`}>
                                <TouchableOpacity
                                    style={tw`px-6 py-3 rounded-full mr-4 bg-gray-100`}
                                    onPress={closeModal}
                                >
                                    <Text style={tw`text-[#643843] font-semibold`}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={tw`px-6 py-3 rounded-full bg-[#643853]`}
                                    onPress={() => {
                                        deleteMessage();
                                        closeModal();
                                    }}
                                >
                                    <Text style={tw`text-white font-semibold`}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            <LinearGradient colors={['#643854', '#99627A']} style={tw`p-4 rounded-b-3xl shadow-lg`}>
                <View style={tw`flex-row items-center justify-between`}>
                    <View>
                        <Text style={tw`text-white font-bold text-xl`}>{userName}</Text>
                        <Text style={tw`text-gray-200 text-sm`}>{userMobile}</Text>
                    </View>
                    <View style={tw`flex-row`}>
                        <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${userMobile}`)}
                            style={tw`bg-white p-2 rounded-full mr-2 shadow`}>
                            <Ionicons name="call" size={24} color="#643853" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={tw`bg-white p-2 rounded-full shadow`}
                            onPress={() => {
                                setIsModalVisible(true);
                                fetchProducts();
                            }}>
                            <Ionicons name="cube" size={24} color="#643853" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <View style={tw`flex-1 px-3 pt-2`}>
                {messages.length === 0 ? (
                    <View style={tw`flex-1 justify-center items-center`}>
                        <Ionicons name="chatbubble-ellipses-outline" size={48} color="gray" />
                        <Text style={tw`text-xl text-gray-600 mt-2`}>No Messages Yet</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={Object.keys(groupMessagesByDate(messages))}
                        keyExtractor={(item) => item}
                        renderItem={renderItem}
                        contentContainerStyle={tw`pb-4`}
                        onRefresh={fetchMessages}
                        refreshing={loading}
                        inverted
                    />
                )}
            </View>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-t-3xl p-4 h-4/5`}>
                        <Text style={tw`text-xl font-bold mb-4 text-[#643854]`}>Share a Product</Text>
                        <View style={tw`flex-row items-center bg-gray-200 rounded-full px-4 mb-4`}>
                            <Ionicons name="search" size={20} color="gray" />
                            <TextInput
                                style={tw`flex-1 p-2 text-base`}
                                placeholder="Search products..."
                                value={searchQuery}
                                onChangeText={handleSearchTextChange}
                            />
                        </View>

                        <FlatList
                            data={products}
                            keyExtractor={(item) => item._id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={tw`p-2 border-b border-gray-200 flex-row items-center`}
                                    onPress={() => {
                                        shareProduct(item);
                                        setIsModalVisible(false);
                                    }}
                                >
                                    <Image
                                        source={{ uri: item.images[0] }}
                                        style={tw`w-16 h-16 rounded-lg mr-3`}
                                    />
                                    <View style={tw`flex-1`}>
                                        <Text style={tw`font-semibold text-gray-500 text-sm`}>{item.name}</Text>
                                        <Text style={tw`text-gray-400 text-sm mt-1`} numberOfLines={2}>
                                            {item.description}
                                        </Text>
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

                        <TouchableOpacity
                            style={tw`mt-4 p-3 rounded-full bg-[#643853]`}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={tw`text-white text-center font-bold`}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={tw`flex-row items-center p-3 bg-white border-t border-gray-200`}>
                <TextInput
                    style={tw`flex-1 p-3 rounded-full bg-gray-100 text-black text-base`}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity
                    style={tw`ml-2 bg-[#643853] p-3 rounded-full`}
                    onPress={sendMessage}
                >
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={tw`ml-2 bg-[#643853] p-3 rounded-full`}
                    onPress={fetchMessages}
                >
                    <Ionicons name="refresh" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}