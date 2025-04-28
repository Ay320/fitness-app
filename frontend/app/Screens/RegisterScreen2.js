import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
//import { AuthContext } from '../../src/AuthContext'; 
import { updateUserProfile } from '../../src/api/user'; 

function RegisterScreen2() {
  const navigation = useNavigation();
  const route = useRoute();
  const { username, token } = route.params;

  const [formData, setFormData] = useState({
    DOB: '',
    selectedDate: new Date(),
    height: '',
    weight: '',
    gender: '',
    unit: 'cm',
    weightUnit: 'kg',
    goal: '',
    expLvl: '',
    formStep: 1,
  });

  const [showDOBInput, setShowDOBInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // State for spinner
  const genderOptions = ['Male', 'Female', 'Other'];
  const heightOptionsCM = Array.from({ length: 150 }, (_, i) => (i + 100).toString());
  const heightOptionsFT = Array.from({ length: 48 }, (_, i) => `${Math.floor(i / 12) + 3}'${i % 12}"`);
  const weightOptionsKG = Array.from({ length: 170 }, (_, i) => (i + 30).toString());
  const weightOptionsLB = Array.from({ length: 350 }, (_, i) => (i + 50).toString());
  const goalOptions = ['Muscle Gain', 'Weight Loss', 'Endurance', 'General Fitness'];
  const expLvlOptions = ['Beginner', 'Intermediate', 'Advanced'];

  const handleChange = (key, value) => setFormData({ ...formData, [key]: value });

  const toggleHeightUnit = () => handleChange('unit', formData.unit === 'cm' ? 'ft' : 'cm');
  const toggleWeightUnit = () => handleChange('weightUnit', formData.weightUnit === 'kg' ? 'lb' : 'kg');

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setFormData((prev) => ({
        ...prev,
        DOB: `${day}/${month}/${year}`,
        selectedDate: selectedDate,
      }));
    }
    setShowDOBInput(false);
  };

  const parseHeight = (height, unit) => {
    if (unit === 'cm') {
      return parseFloat(height);
    } else {
      const [feet, inches] = height.split("'").map(s => parseInt(s.replace('"', '')));
      const totalInches = feet * 12 + inches;
      return totalInches * 2.54;
    }
  };

  const parseWeight = (weight, weightUnit) => {
    const w = parseFloat(weight);
    return weightUnit === 'kg' ? w : w * 0.453592;
  };

  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (field) => {
    if (!formData[field]) {
      alert(`Please select your ${field}`);
      return;
    }
    if (formData.formStep < 6) {
      handleChange('formStep', formData.formStep + 1);
    } else {
      submitProfile();
    }
  };

  const submitProfile = async () => {
    setIsUpdating(true); // Show spinner
    try {
      await new Promise(resolve => setTimeout(resolve, 4000)); // 4-second delay
      const heightCm = parseHeight(formData.height, formData.unit);
      const weightKg = parseWeight(formData.weight, formData.weightUnit);
      const dateOfBirth = formatDate(formData.DOB);
      const profileData = {
        username: route.params.username,
        date_of_birth: dateOfBirth,
        gender: formData.gender,
        weight_kg: weightKg,
        height_cm: heightCm,
        fitness_goal: formData.goal,
        experience_level: formData.expLvl,
        bio: '',
      };
      await updateUserProfile(token, profileData);
      navigation.navigate('MainScreen');
    } catch (error) {
      console.error('Profile Update Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert('Failed to update profile: ' + error.message);
    } finally {
      setIsUpdating(false); // Hide spinner
    }
  };

  return (
    <View style={styles.background}>
      <Text style={styles.innerText}>Register</Text>
      <Image
        source={{ uri: 'https://images.vexels.com/media/users/3/132662/isolated/preview/9abcfba41c34a0aaa7ef1eeb82d944ad-weight-lift-icon.png' }}
        style={{ width: '75%', height: '10%' }}
      />

      {formData.formStep === 1 && (
        <>
          <Text style={styles.innerText}>Choose your date of birth</Text>
          <TouchableOpacity onPress={() => setShowDOBInput(true)} style={styles.dateButton}>
            <Text style={styles.buttonText}>{formData.DOB || 'DD/MM/YYYY'}</Text>
          </TouchableOpacity>
          {showDOBInput && (
            <DateTimePicker
              value={formData.selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
          <TouchableOpacity onPress={() => handleSubmit('DOB')} style={styles.button}>
            <Text style={styles.buttonText}>Confirm DOB</Text>
          </TouchableOpacity>
        </>
      )}

      {formData.formStep === 2 && (
        <>
          <Text style={styles.innerText}>Choose your gender</Text>
          <Picker
            selectedValue={formData.gender}
            style={styles.picker}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <Picker.Item label="Select Gender" value="" />
            {genderOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
          <TouchableOpacity onPress={() => handleSubmit('gender')} style={styles.button}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}

      {formData.formStep === 3 && (
        <>
          <Text style={styles.innerText}>Choose your height ({formData.unit})</Text>
          <Picker
            selectedValue={formData.height}
            style={styles.picker}
            onValueChange={(value) => handleChange('height', value)}
          >
            <Picker.Item label="Select Height" value="" />
            {(formData.unit === 'cm' ? heightOptionsCM : heightOptionsFT).map((option) => (
              <Picker.Item key={option} label={formData.unit === 'cm' ? `${option} cm` : option} value={option} />
            ))}
          </Picker>
          <TouchableOpacity onPress={toggleHeightUnit} style={styles.toggleButton}>
            <Text style={styles.buttonText}>
              {formData.unit === 'cm' ? 'Switch to Feet' : 'Switch to Centimeters'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSubmit('height')} style={styles.button}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}

      {formData.formStep === 4 && (
        <>
          <Text style={styles.innerText}>Choose your weight ({formData.weightUnit})</Text>
          <Picker
            selectedValue={formData.weight}
            style={styles.picker}
            onValueChange={(value) => handleChange('weight', value)}
          >
            <Picker.Item label="Select Weight" value="" />
            {(formData.weightUnit === 'kg' ? weightOptionsKG : weightOptionsLB).map((option) => (
              <Picker.Item key={option} label={`${option} ${formData.weightUnit}`} value={option} />
            ))}
          </Picker>
          <TouchableOpacity onPress={toggleWeightUnit} style={styles.toggleButton}>
            <Text style={styles.buttonText}>
              {formData.weightUnit === 'kg' ? 'Switch to Pounds' : 'Switch to Kilograms'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSubmit('weight')} style={styles.button}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}

      {formData.formStep === 5 && (
        <>
          <Text style={styles.innerText}>Choose your goal</Text>
          <Picker
            selectedValue={formData.goal}
            style={styles.picker}
            onValueChange={(value) => handleChange('goal', value)}
          >
            <Picker.Item label="Select Goal" value="" />
            {goalOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
          <TouchableOpacity onPress={() => handleSubmit('goal')} style={styles.button}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}

      {formData.formStep === 6 && (
        <>
          <Text style={styles.innerText}>Choose your experience level</Text>
          <Picker
            selectedValue={formData.expLvl}
            style={styles.picker}
            onValueChange={(value) => handleChange('expLvl', value)}
          >
            <Picker.Item label="Select Experience Level" value="" />
            {expLvlOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
          {isUpdating ? (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.updatingText}>Updating profile...</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleSubmit('expLvl')} style={styles.button}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      <View style={styles.sectionGap} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'rgb(0, 0, 0)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  innerText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    height: 70,
    backgroundColor: 'rgb(2, 77, 87)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    borderRadius: 35,
  },
  buttonText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 20,
  },
  picker: {
    height: 60,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    marginVertical: 10,
    color: 'white',
  },
  toggleButton: {
    marginBottom: 10,
    backgroundColor: 'rgb(2, 77, 87)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
  },
  dateButton: {
    width: '40%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255,.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    borderRadius: 35,
    fontSize: 20,
  },
  sectionGap: {
    height: 40,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  updatingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});

export default RegisterScreen2;