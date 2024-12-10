import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import StyledButton from '../../components/StyledButton';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateProduct() {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Piece');
    const [loading, setLoading] = useState(false); // Loading state
    const [status, setStatus] = useState('Available');

    const handleSelectImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission required", "You've refused to allow this app to access your photos!");
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (pickerResult && !pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            const files = pickerResult.assets.map(asset => ({
                uri: asset.uri,
                name: asset.fileName || `image_${Date.now()}.jpg`,
                type: `test/${asset.uri.split('.')[1]}`,
            }));
            setImages(files);
        }
    };

    const handleUploadToCloudinary = async (image) => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'hdjenterprise12');

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('https://api.cloudinary.com/v1_1/ds4kwokfq/image/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data.secure_url;
            } else {
                Alert.alert('Upload Error', 'Failed to upload image to Cloudinary');
                return null;
            }
        } catch (error) {
            Alert.alert('Upload Error', 'Failed to upload image to Cloudinary');
            return null;
        }
    };

    const handleCreateProduct = async () => {
        if (!productName || images.length === 0) {
            Alert.alert('Validation Error', 'Please fill Product Name and upload images');
            return;
        }

        setLoading(true); // Start loading

        try {
            const uploadedImageUrls = [];
            for (const image of images) {
                const imageUrl = await handleUploadToCloudinary(image);
                if (imageUrl) {
                    uploadedImageUrls.push(imageUrl);
                }
            }

            if (uploadedImageUrls.length === 0) {
                Alert.alert('Upload Error', 'Failed to upload images');
                return;
            }

            const productData = {
                name: productName,
                price,
                description,
                images: uploadedImageUrls,
                unit: selectedOption,
                status
            };

            const token = await AsyncStorage.getItem('token');
            await axios.post('https://landmen.in/api/products', productData, { headers: { Authorization: token } });
            Alert.alert('Success', 'Product created successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create product. Please try again.');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <TextInput
                placeholder="Product Name"
                value={productName}
                onChangeText={setProductName}
                style={tw`border border-gray-600 rounded-full p-3 px-5 w-full max-w-md mb-4`}
            />
            <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={tw`border border-gray-600 rounded-full p-3 px-5 w-full max-w-md mb-4`}
            />
            <View style={tw`border border-gray-600 rounded-full px-2 w-full max-w-md mb-4`}>
                <Picker
                    selectedValue={selectedOption}
                    onValueChange={(itemValue) => setSelectedOption(itemValue)}
                    style={tw`w-full text-gray-600`}
                >
                    <Picker.Item label="Piece" value="Piece" />
                    <Picker.Item label="Kg" value="Kg" />
                    <Picker.Item label="Box" value="Box" />
                    <Picker.Item label="Unit" value="Unit" />
                </Picker>
            </View>
            <View style={tw`border border-gray-600 rounded-full px-2 w-full max-w-md mb-4`}>
                <Picker
                    selectedValue={status}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                    style={tw`w-full text-gray-600`}
                >
                    <Picker.Item label="Available" value="Available" />
                    <Picker.Item label="Coming Soon" value="CommingSoon" />
                </Picker>
            </View>
            <TouchableOpacity onPress={handleSelectImages} style={tw`border border-gray-400 bg-gray-300 rounded-full p-3 px-5 w-full max-w-md mb-4`}>
                <Text style={tw``}>Select Images</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                {images.map((image, index) => (
                    <Image
                        key={index}
                        source={{ uri: image.uri }}
                        style={{ width: 100, height: 100, margin: 4 }}
                    />
                ))}
            </View>
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={tw`border border-gray-600 rounded p-3 px-5 w-full max-w-md mb-4`}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#643843" />
            ) : (
                <StyledButton onPress={handleCreateProduct} title="Create Product" />
            )}
        </ScrollView>
    );
}
