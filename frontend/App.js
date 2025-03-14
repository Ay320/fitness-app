import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button, TextInput, Dimensions, useWindowDimensions } from 'react-native';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen2 from './app/Screens/RegisterScreen2';
import WelcomeScreen from './app/Screens/WelcomeScreen';
import RegisterScreen from './app/Screens/RegisterScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
          <Stack.Navigator initialRouteName="WelcomeScreen">
              <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} /> 
              <Stack.Screen name="RegisterScreen2" component={RegisterScreen2} />
          </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({

});
