import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@expo/vector-icons/Feather';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../src/AuthContext'; 
import { getUserProfile, updateUserProfile } from '../../src/api/user'; 

const validationSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name too short').required('Name is required'),
  bio: Yup.string().max(200, 'Bio too long'),
  height: Yup.string().required('Height is required'),
  weight: Yup.string().required('Weight is required'),
  DOB: Yup.string().required('Date of Birth is required'),
  gender: Yup.string().required('Gender is required'),
  goal: Yup.string().required('Fitness goal is required'),
  expLvl: Yup.string().required('Experience level is required'),
});

const ProfileScreen = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState({
    name: '',
    bio: '',
    avatar: 'https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=',
    email: '',
    height: '',
    weight: '',
    DOB: '',
    gender: '',
    goal: '',
    expLvl: '',
  });
  const [editMode, setEditMode] = useState(false);

  const fieldLabels = {
    name: 'Name',
    bio: 'Bio',
    height: 'Height',
    weight: 'Weight',
    DOB: 'Date of Birth',
    gender: 'Gender',
    goal: 'Fitness Goal',
    expLvl: 'Experience Level',
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Load avatar from AsyncStorage
        const avatarUri = await AsyncStorage.getItem('avatar');
        setUser(prev => ({ ...prev, avatar: avatarUri || user.avatar }));

        if (token) {
          // Fetch user profile from backend
          const data = await getUserProfile(token);
          setUser(prev => ({
            ...prev,
            name: data.username,
            bio: data.bio || '',
            height: `${data.height_cm} cm`,
            weight: `${data.weight_kg} kg`,
            DOB: data.date_of_birth,
            gender: data.gender,
            goal: data.fitness_goal,
            expLvl: data.experience_level,
            email: data.email,
          }));
        }
      } catch (error) {
        console.log('Error initializing profile:', error);
      }
    };
    init();
  }, [token]);

  const handleAvatarUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newAvatarUri = result.assets[0].uri;
      setUser(prev => ({ ...prev, avatar: newAvatarUri }));
      await AsyncStorage.setItem('avatar', newAvatarUri);
    }
  };

  const onSubmit = async (values) => {
    try {
      const profileData = {
        username: values.name,
        date_of_birth: values.DOB,
        gender: values.gender,
        weight_kg: parseFloat(values.weight.split(' ')[0]),
        height_cm: parseFloat(values.height.split(' ')[0]),
        fitness_goal: values.goal,
        experience_level: values.expLvl,
        bio: values.bio,
      };
      await updateUserProfile(token, profileData);
      setUser(values);
      setEditMode(false);
    } catch (error) {
      console.log('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.background}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleAvatarUpload}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.avatarEditIcon}>
            <Icon name="edit-3" size={20} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user.name}</Text>
      </View>

      <Formik
        initialValues={user}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={onSubmit}
      >
        {({ handleChange, handleSubmit, values }) => (
          <View style={styles.formContainer}>
            {editMode ? (
              <>
                {Object.keys(user).map((key) => (
                  key !== 'avatar' && key !== 'email' && (
                    <View key={key} style={styles.inputContainer}>
                      <Text style={styles.label}>{fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                      <TextInput
                        style={styles.input}
                        value={values[key]}
                        onChangeText={handleChange(key)}
                      />
                    </View>
                  )
                ))}
                <View style={styles.buttonContainer}>
                  <Button title="Cancel" onPress={() => setEditMode(false)} color="#B8B8B8" />
                  <Button title="Save" onPress={handleSubmit} />
                </View>
              </>
            ) : (
              <View style={styles.textContainer}>
                <Text style={styles.detailTitle}>Bio: {user.bio}</Text>
                {Object.entries(user).map(([key, value]) => (
                  key !== 'avatar' && key !== 'bio' && key !== 'name' && key !== 'email' && (
                    <Text key={key} style={styles.detailTitle}>
                      {fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                    </Text>
                  )
                ))}
              </View>
            )}
          </View>
        )}
      </Formik>

      {!editMode && (
        <TouchableOpacity style={styles.editProfileButton} onPress={() => setEditMode(true)}>
          <Icon name="edit-2" size={16} color="rgb(2, 77, 87)" />
          <Text style={styles.editText}>Edit profile</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = {
  background: {
    flexGrow: 1,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    padding: 20
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgb(2, 77, 87)'
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgb(2, 77, 87)',
    borderRadius: 15,
    padding: 6
  },
  name: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 15
  },
  formContainer: {
    width: '90%',
    alignItems: 'center'
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: 'white',
    fontSize: 16
  },
  detailTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8
  },
  editProfileButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  editText: {
    color: 'rgb(2, 77, 87)',
    marginLeft: 5,
    fontSize: 16
  },
};

export default ProfileScreen;
