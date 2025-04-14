import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button, TextInput, Dimensions, useWindowDimensions } from 'react-native';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen2 from './app/Screens/RegisterScreen2';
import WelcomeScreen from './app/Screens/WelcomeScreen';
import RegisterScreen from './app/Screens/RegisterScreen';
import MainScreen from './app/Screens/MainScreen';
import FindWorkoutScreen from './app/Screens/FindWorkoutScreen';
import WorkoutDetailsScreen from './app/Screens/WorkoutDetailsScreen';
import ProfileScreen from './app/Screens/ProfileScreen';
import SessionScreen from './app/Screens/SessionScreen';
import AnalyticsScreen from './app/Screens/AnalyticsScreen';
import PlanScreen from './app/Screens/PlanScreen';


const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName = "WelcomeScreen">
                <Stack.Screen name = "WelcomeScreen" component={WelcomeScreen} />
                <Stack.Screen name = "RegisterScreen" component={RegisterScreen} /> 
                <Stack.Screen name = "RegisterScreen2" component={RegisterScreen2} />
                <Stack.Screen name = "FindWorkoutScreen" component = {FindWorkoutScreen} />
                <Stack.Screen name = "WorkoutDetailsScreen" component = {WorkoutDetailsScreen} />
                <Stack.Screen name = "ProfileScreen" component = {ProfileScreen} />
                <Stack.Screen name = "MainScreen" component = {MainScreen} />
                <Stack.Screen name = "AnalyticsScreen" component = {AnalyticsScreen} />
                <Stack.Screen name = "PlanScreen" component = {PlanScreen} />
                <Stack.Screen name = "SessionScreen" component = {SessionScreen} />     
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({

});
