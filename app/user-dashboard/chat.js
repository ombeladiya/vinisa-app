import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Image, Pressable, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);
    const router = useRouter();
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalVisible2, setIsModalVisible2] = useState(false);

    // Function to handle long press
    const handleLongPress = (message) => {
        if ((message.quantity && isWithinTimeLimit(message.createdAt)) || !message.quantity) {
            setSelectedMessage(message);
            setIsModalVisible2(true);
        } else {
            Alert.alert("Delete Option Disabled", "You can only Cancel Order within 20 minutes.");
        }
    };
    const isWithinTimeLimit = (createdAt) => {
        const creationTime = new Date(createdAt).getTime();
        const currentTime = new Date().getTime();
        const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds
        return currentTime - creationTime <= twentyMinutes;
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
            const res = await axios.get('https://landmen.in/api/chat/messages', {
                headers: { Authorization: token },
            });
            setMessages(res.data.reverse()); // Fetch messages and reverse order
        } catch (error) {
            Alert.alert('Error', 'Could not fetch messages.');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (newMessage.trim() === '') return;

        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post(
                'https://landmen.in/api/chat/send-message',
                {
                    message: newMessage,
                    isSender: true,
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

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const navigateToProductDetail = async (productId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`https://landmen.in/api/products/${productId}`, {
                headers: { Authorization: token },
            });

            const product = response.data;

            // Check if product data exists
            if (product) {
                router.push({
                    pathname: 'user-dashboard/product-details',
                    params: { productData: JSON.stringify(product) },
                });
            } else {
                // Show alert if the product is not found
                Alert.alert('Error', 'Product not found.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not fetch product details.');
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        return messages.reduce((acc, message) => {
            const messageDate = formatDate(message.createdAt);
            if (!acc[messageDate]) {
                acc[messageDate] = []; // Create a new array for this date
            }
            acc[messageDate].unshift(message); // Push the message to the corresponding date
            return acc;
        }, {});
    };

    const renderItem = ({ item, index }) => {
        const groupedMessages = groupMessagesByDate(messages);
        const dates = Object.keys(groupedMessages);

        // Determine the current date and messages for that date
        const currentDate = dates[index];
        const messagesForDate = groupedMessages[currentDate];

        return (
            <View>
                {/* Show date above message if it's a new day */}
                <View style={tw`flex items-center my-2`}>
                    <Text style={tw`text-gray-500 text-sm`}>{currentDate}</Text>
                </View>

                {/* Render each message for the date group */}
                {messagesForDate.map((message, msgIndex) => (
                    <Pressable
                        key={msgIndex}
                        onPress={() => (message.productId ? navigateToProductDetail(message.productId) : null)}
                        onLongPress={() => message.isSender && handleLongPress(message)}
                        style={tw`mb-2 p-2 px-4 rounded-2xl max-w-4/5 ${message.isSender ? 'bg-gray-200 self-end' : 'bg-[#643853] self-start'}`}
                    >
                        {message.image && !message.quantity && (
                            <Image source={{ uri: message.image }} style={tw`w-60 h-60 rounded`} resizeMode="contain" />
                        )}
                        {message.image && message.quantity && (
                            <View style={tw`flex-row w-full border-l-[3px] border-gray-400`}>
                                <Image source={{ uri: message.image }} style={tw`w-20 h-20 rounded ml-1`} />
                                <View style={tw`p-2 flex-1`}>
                                    <Text style={tw`text-sm text-gray-900 font-bold`}>
                                        {message.name.length > 30 ? `${message.name.substring(0, 22)}...` : message.name}
                                    </Text>
                                    <Text style={tw`text-[14px] text-gray-800`}>Quantity: {message.quantity}</Text>
                                </View>
                            </View>
                        )}
                        {message.message && (
                            <Text style={[tw`text-sm`, message.isSender ? tw`text-black` : tw`text-gray-100`]}>
                                {message.message}
                            </Text>
                        )}
                        {message.quantity ? <View style={tw`flex flex-row justify-between`}>
                            <Text><Icon name="checkmark-done-circle" size={20} color="green" /></Text>
                            <Text style={[tw`text-[10px] mt-1 self-start text-gray-600`]}>{formatTime(message.createdAt)}</Text>
                        </View> : <Text style={[tw`text-[10px] mt-1`, message.isSender ? tw`self-end text-gray-600` : tw`self-start text-gray-200`]}>
                            {formatTime(message.createdAt)}
                        </Text>}
                    </Pressable>
                ))}
            </View>
        );
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            {messages.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <Ionicons name="chatbubble-ellipses-outline" size={48} color="gray" />
                    <Text style={tw`text-xl text-gray-600 mt-2`}>No Messages Yet</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={Object.keys(groupMessagesByDate(messages))} // Use the dates as the data
                    keyExtractor={(item) => item} // Use the date as the key
                    renderItem={renderItem}
                    contentContainerStyle={tw`pb-8 px-3`}
                    onRefresh={fetchMessages}
                    refreshing={loading}
                    inverted
                />
            )}
            <Modal
                transparent={true}
                visible={isModalVisible2}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-t-3xl p-6`}>
                        <Text style={tw`text-[16px] font-bold mb-4 text-[#643843]`}>Delete Message</Text>
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
            <View style={tw`flex-row items-center p-3 bg-white border-t border-gray-200`}>
                <TextInput
                    style={tw`flex-1 p-3 rounded-full bg-gray-100 text-black text-base`}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <Pressable style={[tw`ml-2 bg-[#643853] p-3 rounded-full`]} onPress={sendMessage}>
                    <Ionicons name="send" size={20} color="white" />
                </Pressable>
                <Pressable
                    style={[tw`ml-2 p-3 rounded-full`, { backgroundColor: '#643853' }]}
                    onPress={fetchMessages}
                >
                    <Ionicons name="refresh" size={20} color="white" />
                </Pressable>
            </View>
        </View>
    );
}
