import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import tw from 'twrnc';

const UserTable = ({ users, onVerify, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);

    // Update filteredUsers when the user list or search query changes
    useEffect(() => {
        setFilteredUsers(
            users.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(user.mobile).includes(searchQuery)
            )
        );
    }, [searchQuery, users]);

    // Open the phone dialer
    const openDialer = (mobile) => {
        Linking.openURL(`tel:${mobile}`);
    };

    // Memoize the renderItem function to avoid unnecessary re-renders
    const renderItem = useCallback(({ item }) => (
        <View style={styles.userCard}>
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity onPress={() => openDialer(item.mobile)}>
                    <Text style={styles.mobile}>{item.mobile}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.actionContainer}>
                <TouchableOpacity onPress={() => onVerify(item._id)} style={styles.actionButton}>
                    {item.approved
                        ? <Icon name="verified" size={23} color="green" />
                        : <Icon name="person-add" size={23} color="red" />
                    }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item._id)} style={styles.actionButton}>
                    <Icon name="trash" size={22} color="#FF0000" />
                </TouchableOpacity>
            </View>
        </View>
    ), [onVerify, onDelete]);

    return (
        <View>
            <View style={tw`flex-row items-center bg-white rounded-full shadow-md px-4 py-2 mb-2`}>
                <Icon name="search" size={20} color="gray" />
                <TextInput
                    value={searchQuery}
                    placeholder="Search by name or mobile..."
                    onChangeText={setSearchQuery}
                    style={tw`flex-1 text-sm pl-2 p-1`}
                />
            </View>
            <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={item => item._id.toString()}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    mobile: {
        fontSize: 14,
        color: '#555',
        textDecorationLine: 'underline',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginHorizontal: 10,  // Adds space between the action buttons
    }
});

export default UserTable;
