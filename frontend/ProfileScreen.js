import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@expo/vector-icons/Feather';
import { updateProfile } from '../store/authSlice';
import validationSchema from '../utils/profileValidation';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [editMode, setEditMode] = useState(false);

  // upload profile picture
   const handleAvatarUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      dispatch(updateProfile({ avatar: result.assets[0].uri }));
    }
  };
  
   return (
    <ScrollView className="bg-gray-50 flex-1 p-4">
      {/* profile information */}
      <View className="items-center mb-8">
        <TouchableOpacity 
          onPress={handleAvatarUpload}
          className="relative"
        >
          <Image
            source={{ uri: user.avatar }}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
          <View className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full">
            <Icon name="edit-3" size={20} color="white" />
          </View>
        </TouchableOpacity>

