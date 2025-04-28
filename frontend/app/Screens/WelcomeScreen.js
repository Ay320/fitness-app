import React, { useState, useContext } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../src/AuthContext';

function WelcomeScreen() {
  const { login, loading, token, user } = useContext(AuthContext)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  //const { login } = useContext(AuthContext); // Use AuthContext to set token
  //const { token } = useContext(AuthContext); // For debugging
  

  //console.log('AuthContext in WelcomeScreen:', AuthContext);
  //console.log('Token from AuthContext:', token);
  const ctx = useContext(AuthContext)
  console.log('ctx.value', ctx)


  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }

    try {
      // This calls signIn + syncUser + sets token/user in context
      const token = await login(email, password);  
      
      navigation.reset({               // reset so back-button doesn’t take you to login
        index: 0,
        routes: [{ name: 'MainScreen' }]
      });
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  return (
    <View style={styles.background}>
      <Text style={styles.innerText}>Welcome to FitTrack!</Text>
      <View style={styles.sectionGap} />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.sectionGap} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>------------------------------------ or ------------------------------------</Text>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
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
    color: 'white',
    fontSize: 20,
  },
  input: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 15,
    color: 'white',
    fontSize: 18,
  },
  orText: {
    color: 'white',
    marginVertical: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  sectionGap: {
    height: 80,
  },
  inputContainer: {
    width: '80%',
  },
});

export default WelcomeScreen;