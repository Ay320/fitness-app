import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@expo/vector-icons/Feather';
import { updateProfile } from '../store/authSlice';
import validationSchema from '../utils/profileValidation';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user || {});
  const [editMode, setEditMode] = useState(false);

  const handleAvatarUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      dispatch(updateProfile({ avatar: result.assets[0].uri }));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleAvatarUpload}>
          <Image
            source={{ uri: user.avatar || 'https://placekitten.com/200/200' }}
            style={styles.avatar}
          />
          <View style={styles.editIcon}>
            <Icon name="edit-3" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {editMode ? (
          <Formik
            initialValues={{ name: user.name || '', bio: user.bio || '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              dispatch(updateProfile(values));
              setEditMode(false);
            }}
          >
            {({ handleChange, handleSubmit, values, errors }) => (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  autoFocus
                />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}

                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Personal Profile"
                  multiline
                  value={values.bio}
                  onChangeText={handleChange('bio')}
                />

                <View style={styles.buttonGroup}>
                  <Button 
                    title="Cancel" 
                    onPress={() => setEditMode(false)} 
                    color="#6B7280"
                  />
                  <Button 
                    title="Save" 
                    onPress={handleSubmit} 
                    color="#3B82F6"
                  />
                </View>
              </View>
            )}
          </Formik>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name || 'Anonymous User'}</Text>
            <Text style={styles.bio}>
              {user.bio || 'No profile description yet'}
            </Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditMode(true)}
            >
              <Icon name="edit-2" size={16} color="#3B82F6" />
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Workout Overview</Text>
        <View style={styles.statsRow}>
          <StatItem label="Total Hours" value={`${user.totalHours || 0}h`} />
          <StatItem label="Completed" value={`${user.workouts || 0} Times`} />
          <StatItem label="Achievements" value={user.achievements || 0} />
        </View>
      </View>
    </ScrollView>
  );
};

const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f3f4f6'
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: 'white'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 20
  },
});

export default ProfileScreen;
