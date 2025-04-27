import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Button, KeyboardAvoidingView, Platform } from 'react-native';
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
    avatar: 'https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg',
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
      const avatarUri = await AsyncStorage.getItem('avatar');
      setUser(prev => ({ ...prev, avatar: avatarUri || prev.avatar }));
      if (token) {
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
    };
    init();
  }, [token]);

  const handleAvatarUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return alert('Camera roll permission required');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets.length) {
      const uri = result.assets[0].uri;
      setUser(prev => ({ ...prev, avatar: uri }));
      await AsyncStorage.setItem('avatar', uri);
    }
  };

  const onSubmit = async (values) => {
    try {
      const profileData = {
        username: values.name,
        date_of_birth: values.DOB,
        gender: values.gender,
        weight_kg: parseFloat(values.weight),
        height_cm: parseFloat(values.height),
        fitness_goal: values.goal,
        experience_level: values.expLvl,
        bio: values.bio,
      };
      await updateUserProfile(token, profileData);
      setUser(values);
      setEditMode(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrapper}>
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handleAvatarUpload} style={styles.avatarWrapper}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.avatarEditIcon}><Icon name="edit-3" size={18} color="#fff"/></View>
            </TouchableOpacity>
            <Text style={styles.userName}>{user.name || 'Your Name'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          <Formik initialValues={user} enableReinitialize validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ handleChange, handleSubmit, values }) => (
              <View style={styles.card}>
                {editMode ? (
                  Object.keys(fieldLabels).map((key) => (
                    <View key={key} style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>{fieldLabels[key]}</Text>
                      <TextInput style={styles.fieldInput} value={values[key]} onChangeText={handleChange(key)} placeholder={`Enter ${fieldLabels[key]}`} />
                    </View>
                  ))
                ) : (
                  <>
                    {user.bio ? (<Text style={styles.bioText}>{user.bio}</Text>) : null}
                    {Object.entries(fieldLabels).map(([key, label]) => key !== 'bio' && (
                      <View key={key} style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{label}</Text>
                        <Text style={styles.detailValue}>{user[key]}</Text>
                      </View>
                    ))}
                  </>
                )}
                <View style={styles.buttonRow}>
                  {editMode ? (
                    <>  
                      <Button title="Cancel" color="#888" onPress={() => setEditMode(false)} />
                      <Button title="Save" onPress={handleSubmit} />
                    </>
                  ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                      <Icon name="edit-2" size={16} color="#0261B7"/>
                      <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#121212' },
  wrapper: { padding: 20, alignItems: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#0261B7' },
  avatarEditIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0261B7', borderRadius: 12, padding: 6 },
  userName: { fontSize: 24, color: '#fff', fontWeight: '700', marginTop: 10 },
  userEmail: { fontSize: 14, color: '#aaa', marginTop: 4 },
  card: { width: '100%', backgroundColor: '#1F1F1F', borderRadius: 12, padding: 16, marginVertical: 10 },
  bioText: { color: '#eee', fontSize: 16, fontStyle: 'italic', marginBottom: 65 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  detailLabel: { color: '#bbb', fontSize: 14, fontWeight: '500' },
  detailValue: { color: '#fff', fontSize: 14 },
  fieldContainer: { marginBottom: 12 },
  fieldLabel: { color: '#ccc', fontSize: 14, marginBottom: 4 },
  fieldInput: { backgroundColor: '#2A2A2A', borderRadius: 6, padding: 10, color: '#fff' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  editButton: { flexDirection: 'row', alignItems: 'center' },
  editButtonText: { color: '#0261B7', fontSize: 16, marginLeft: 6 },
};

export default ProfileScreen;
