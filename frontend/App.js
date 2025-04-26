import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator }  from '@react-navigation/stack';
import * as SplashScreen         from 'expo-splash-screen';
import { useFonts }              from 'expo-font';
import { AuthProvider }          from './src/AuthContext';

// Screens
import WelcomeScreen     from './app/Screens/WelcomeScreen';
import RegisterScreen    from './app/Screens/RegisterScreen';
import RegisterScreen2   from './app/Screens/RegisterScreen2';
import MainScreen        from './app/Screens/MainScreen';
import ProfileScreen     from './app/Screens/ProfileScreen';
import FindWorkoutScreen from './app/Screens/FindWorkoutScreen';
import PlanScreen        from './app/Screens/PlanScreen';
import SessionScreen     from './app/Screens/SessionScreen';
import WorkoutDetailsScreen from './app/Screens/WorkoutDetailsScreen';
import AnalyticsScreen   from './app/Screens/AnalyticsScreen';
import EditPlanScreen    from './app/Screens/EditPlanScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  // 1. Load fonts (so splash stays until ready)
  const [fontsLoaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 2. When fontsLoaded → hide splash
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 3. Don’t render until splash is hidden
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="WelcomeScreen"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="WelcomeScreen"     component={WelcomeScreen} />
          <Stack.Screen name="RegisterScreen"    component={RegisterScreen} />
          <Stack.Screen name="RegisterScreen2"   component={RegisterScreen2} />
          <Stack.Screen name="MainScreen"        component={MainScreen} />
          <Stack.Screen name="ProfileScreen"     component={ProfileScreen} />
          <Stack.Screen name="FindWorkoutScreen" component={FindWorkoutScreen} />
          <Stack.Screen name="PlanScreen"        component={PlanScreen} />
          <Stack.Screen name="SessionScreen"     component={SessionScreen} />
          <Stack.Screen name="WorkoutDetailsScreen" component={WorkoutDetailsScreen} />
          <Stack.Screen name="AnalyticsScreen"   component={AnalyticsScreen} />
          <Stack.Screen name="EditPlanScreen"    component={EditPlanScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
