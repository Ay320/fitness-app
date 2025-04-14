import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

function RegisterScreen2() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    DOB: '',
    selectedDate: new Date(),
    height: '',
    weight: '',
    gender: '',
    unit: 'cm',
    weightUnit: 'kg',
    goal: '',
    targetWeight: '',
    expLvl: '',
    formStep: 1,
  });

  const [showDOBInput, setShowDOBInput] = useState(false);
  const genderOptions = ['Male', 'Female', 'Other'];
  const heightOptionsCM = Array.from({ length: 150 }, (_, i) => i + 100);
  const heightOptionsFT = Array.from({ length: 48 }, (_, i) => `${Math.floor(i / 12) + 3}'${i % 12}"`);
  const weightOptionsKG = Array.from({ length: 170 }, (_, i) => i + 30);
  const weightOptionsLB = Array.from({ length: 350 }, (_, i) => i + 50);
  const goalOptions = ['Muscle Gain', 'Weight Loss', 'Endurance', 'General Fitness']
  const expLvlOptions = ['Beginner', 'Intermediate', 'Experienced']

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

  const handleSubmit = (field) => {
    if (!formData[field]) {
      alert(`Please enter your ${field}`);
      return;
    }

    if (formData.goal === "General Fitness" || formData.goal === "Endurance") {
        handleChange('formStep', formData.formStep + 2);
    } else {
        handleChange('formStep', formData.formStep + 1);
    }

    if (formData.formStep == 7){
        navigation.navigate("MainScreen");
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
              <Picker.Item key={option} label={`${option}${formData.unit === 'cm' ? 'cm' : ''}`} value={option} />
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
              <Picker.Item key={option} label={`${option}${formData.weightUnit}`} value={option} />
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
          <Text style={styles.innerText}>Choose your target weight ({formData.weightUnit})</Text>
          <Picker
            selectedValue={formData.targetWeight}
            style={styles.picker}
            onValueChange={(value) => handleChange('targetWeight', value)}
          >
            <Picker.Item label="Select Weight" value="" />
            {(formData.weightUnit === 'kg' ? weightOptionsKG : weightOptionsLB).map((option) => (
              <Picker.Item key={option} label={`${option}${formData.weightUnit}`} value={option} />
            ))}
          </Picker>
          <TouchableOpacity onPress={toggleWeightUnit} style={styles.toggleButton}>
            <Text style={styles.buttonText}>
              {formData.weightUnit === 'kg' ? 'Switch to Pounds' : 'Switch to Kilograms'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSubmit('targetWeight')} style={styles.button}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}

      {formData.formStep === 7 && (
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
          <TouchableOpacity onPress={() => handleSubmit('expLvl')} style={styles.button}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}
      <View style = {styles.sectionGap} />
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
  input: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    color: 'white',
    fontSize: 18,
  },
  sectionGap: {
    height: 40,
  },
  inputContainer: {
    width: '80%',
    alignItems: 'center',
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
  smallerText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
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
  dateButtonText: {
    color: 'rgba(255, 255, 255,0.2)',
    fontSize: 20,
  },
});

export default RegisterScreen2;
