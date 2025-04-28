import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../src/firebaseAuth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { syncUser } from '../../src/api/authApi';

function RegisterScreen(props) {
  const [fName, setFName] = useState('');
  const [sName, setSName] = useState('');
  const [email, setEmail] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!fName || !sName || !email || !cEmail || !password || !cPassword) {
      Alert.alert("Please complete all fields");
      return;
    }
    if (email !== cEmail) {
      Alert.alert("Emails do not match.");
      return;
    }
    if (password !== cPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      // 1) create the user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // 2) grab the JWT
      const token = await userCredential.user.getIdToken();                        
      // 3) sync with your backend
      await syncUser(token);                                                         
      // 4) build a display name
      const username = `${fName} ${sName}`;
      // 5) pass both username & token to the next step
      navigation.navigate('RegisterScreen2', { username, token });                   
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    }
    finally {
        setLoading(false); // Hide loading indicator
      }
  };

  return (
    <View style={styles.background}>
      <Text style={styles.innerText}>Register</Text>
      <View style={styles.sectionGap} />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='First Name'
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={fName}
          onChangeText={setFName}
          autoCapitalize='words'
        />
        <TextInput
          style={styles.input}
          placeholder='Last Name'
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={sName}
          onChangeText={setSName}
          autoCapitalize='words'
        />
        <TextInput
          style={styles.input}
          placeholder='Email'
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
        />
        <TextInput
          style={styles.input}
          placeholder='Confirm Email'
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={cEmail}
          onChangeText={setCEmail}
          keyboardType='email-address'
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder='Confirm Password'
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={cPassword}
          onChangeText={setCPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.sectionGap} />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
      <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Confirm'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "rgb(0, 0, 0)",
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  innerText: {
    color: "rgb(255, 255, 255)",
    fontSize: 40,
    marginBottom: 20,
    textAlign: "center"
  },
  button: {
    width: "80%",
    height: 70,
    backgroundColor: "rgb(2, 77, 87)",
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    borderRadius: 35,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
  input: {
    width: '100%',
    height: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    color: "white",
    fontSize: 18,
  },
  sectionGap: {
    height: 40,
  },
  inputContainer: {
    width: "80%",
  }
});

export default RegisterScreen;