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

        {editMode ? (
          <Formik
            initialValues={{ name: user.name, bio: user.bio }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              dispatch(updateProfile(values));
              setEditMode(false);
            }}
          >
            {({ handleChange, handleSubmit, values, errors }) => (
              <View className="items-center mt-4 w-full">
                <TextInput
                  className="bg-white p-3 rounded-lg w-full mb-2"
                  placeholder="name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                />
                {errors.name && <Text className="text-red-500">{errors.name}</Text>}

                <TextInput
                  className="bg-white p-3 rounded-lg w-full h-24 mb-2"
                  placeholder="personal profile"
                  multiline
                  value={values.bio}
                  onChangeText={handleChange('bio')}
                />
                
                <View className="flex-row gap-4 mt-2">
                  <Button title="cancel" onPress={() => setEditMode(false)} />
                  <Button title="save" onPress={handleSubmit} />
                </View>
              </View>
            )}
          </Formik>
        ) : (
          <View className="items-center mt-4">
            <Text className="text-2xl font-bold">{user.name}</Text>
            <Text className="text-gray-600 mt-2">{user.bio || 'There is no profile'}</Text>
            <TouchableOpacity 
              className="mt-4 flex-row items-center"
              onPress={() => setEditMode(true)}
            >
              <Icon name="edit-2" size={16} color="#3B82F6" />
              <Text className="text-blue-500 ml-1">edit profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

          
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <Text className="text-lg font-semibold mb-4">运动总览</Text>
        <View className="flex-row justify-between">
          <StatItem label="Total hours" value={`${user.totalHours}h`} delta="+2h" />
          <StatItem label="Completed times " value={user.workouts} delta="+3次" />
          <StatItem label="Achievements" value={user.achievements} icon="award" />
        </View>
      </View>
      

export default ProfileScreen;
