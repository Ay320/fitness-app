import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function RegisterScreen(props) {
    const [fName, setFName] = useState('');
    const [sName, setSName] = useState('');
    const [email, setEmail] = useState('');
    const [cEmail, setCEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cPassword, setCPassword] = useState('');
    const navigation = useNavigation();

    const handleRegister = () => {
        console.log("fName:", fName);
        console.log("sName", sName);
        console.log("Email:", email);
        console.log("CEmail:", cEmail);
        console.log("Password", password);
        console.log("CPassword", cPassword);
        if (!fName || !sName || !email || !cEmail || !password || !cPassword) {
            alert ("Please complete all fields")
        } //else {
        navigation.navigate('RegisterScreen2')
        //}
        
    }
    return (
      <View style = {styles.background}>
        <Text style = {styles.innerText}> Register</Text>
        <View style = {styles.sectionGap}/>
        <View style = {styles.inputContainer}>
            <TextInput 
                style = {styles.input}
                placeholder='First Name'
                placeholderTextColor="rgba(255,255,255,0.7)"
                value = {fName}
                onChangeText = {setFName}
                autoCapitalize='words'
            ></TextInput>
            <TextInput 
                style = {styles.input}
                placeholder='Last Name'
                placeholderTextColor="rgba(255,255,255,0.7)"
                value = {sName}
                onChangeText = {setSName}
                autoCapitalize='words'
            ></TextInput>
            <TextInput 
                style = {styles.input}
                placeholder='Email'
                placeholderTextColor="rgba(255,255,255,0.7)"
                value = {email}
                onChangeText = {setEmail}
                keyboardType='email-address'
            ></TextInput>
            <TextInput 
                style = {styles.input}
                placeholder='Confirm Email'
                placeholderTextColor="rgba(255,255,255,0.7)"
                value = {cEmail}
                onChangeText = {setCEmail}
                keyboardType='email-address'
            ></TextInput>
            <TextInput 
                style = {styles.input}
                placeholder='Password'
                placeholderTextColor="rgba(255,255,255,0.7)"
                value = {password}
                onChangeText = {setPassword}
                secureTextEntry
            ></TextInput>
            <TextInput 
                style = {styles.input}
                placeholder='Confirm Password'
                placeholderTextColor="rgba(255,255,255,0.7)"
                value = {cPassword}
                onChangeText = {setCPassword}
                secureTextEntry
            ></TextInput>
        </View>
        <View style = {styles.sectionGap}/>
        <TouchableOpacity style = {styles.button} onPress = {handleRegister}>
            <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor:"rgb(0, 0, 0)",
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
    button:{
        width: "80%",
        height: 70,
        backgroundColor:"rgb(2, 77, 87)",
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
        borderRadius: 35,
    },
    buttonText:{
        color: "white",
        fontSize: 20,
    },
    input:{
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
        height:40,
    },
    inputContainer:{
        width: "80%",
    }
    })
export default RegisterScreen;