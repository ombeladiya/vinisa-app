import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import StyledButton from '../../components/StyledButton';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';

export default function editProduct() {
    const { productData } = useLocalSearchParams();
    const product = JSON.parse(productData);
    const [productName, setProductName] = useState(product.name);
    const [price, setPrice] = useState(product.price?.toString());
    const [description, setDescription] = useState(product.description);
    const [images, setImages] = useState([]);
    const [selectedOption, setSelectedOption] = useState(product.unit);
    const [existingImages, setExistingImages] = useState(product.images);
    const [status, setStatus] = useState(product.status);

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
                type: `image/${asset.uri.split('.')[1]}`,
            }));
            setImages(files);
        }
    };

    const handleDeleteExistingImage = (indexToDelete) => {
        const updatedImages = existingImages.filter((_, index) => index !== indexToDelete);
        setExistingImages(updatedImages);
    };

    const handleUploadToCloudinary = async (image) => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'hdjenterprise12');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/ds4kwokfq/image/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
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

    const handleUpdateProduct = async () => {
        if (!productName || (images.length === 0 && existingImages.length === 0)) {
            Alert.alert('Validation Error', 'Please fill all fields and upload images');
            return;
        }

        try {
            const uploadedImageUrls = [...existingImages];
            for (const image of images) {
                const imageUrl = await handleUploadToCloudinary(image);
                if (imageUrl) {
                    uploadedImageUrls.push(imageUrl);
                }
            }

            const updatedProductData = {
                ...product,
                name: productName,
                price,
                description,
                status,
                images: uploadedImageUrls,
                unit: selectedOption,
            };

            const token = await AsyncStorage.getItem('token');
            await axios.put(`https://landmen.in/api/products/${product._id}`, updatedProductData, {
                headers: {
                    Authorization: token,
                },
            });
            Alert.alert('Success', 'Product updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update product. Please try again.');
        }
    };

    return (
        <ScrollView contentContainerStyle={tw`p-6 bg-white`}>
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

            <View style={tw`border border-gray-600 rounded-full px-3 w-full max-w-md mb-4`}>
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
                    <Picker.Item label="Comming Soon" value="CommingSoon" />
                </Picker>
            </View>

            <TouchableOpacity
                onPress={handleSelectImages}
                style={tw`border bg-gray-100 border-gray-600 rounded-full p-3 px-5 w-full max-w-md mb-4`}
            >
                <Text style={tw`text-black text-center`}>Select New Images</Text>
            </TouchableOpacity>

            <View style={tw`flex-row flex-wrap mb-4`}>
                {existingImages && existingImages.map((image, index) => (
                    <View key={index} style={tw`relative`}>
                        <Image
                            source={{ uri: image }}
                            style={tw`w-24 h-24 rounded-lg m-2`}
                        />
                        <TouchableOpacity
                            onPress={() => handleDeleteExistingImage(index)}
                            style={tw`absolute top-1 right-1  rounded-full p-1`}
                        >
                            <Text><Icon name="minus-circle" size={20} color="red" /></Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {images.map((image, index) => (
                    <Image
                        key={index}
                        source={{ uri: image.uri }}
                        style={tw`w-24 h-24 rounded-lg m-2`}
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

            <StyledButton onPress={handleUpdateProduct} title="Update Product" />
        </ScrollView>
    );
}
