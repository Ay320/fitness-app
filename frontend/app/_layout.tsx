/*
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
*/

/*
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../src/AuthContext';
import WelcomeScreen from './Screens/WelcomeScreen';
import RegisterScreen from './Screens/RegisterScreen';
import RegisterScreen2 from './Screens/RegisterScreen2';
import MainScreen from './Screens/MainScreen';
import ProfileScreen from './Screens/ProfileScreen';
import FindWorkoutScreen from './Screens/FindWorkoutScreen';
import PlanScreen from './Screens/PlanScreen';
import AnalyticsScreen from './Screens/AnalyticsScreen';
import SessionScreen from './Screens/SessionScreen';
import WorkoutDetailsScreen from './Screens/WorkoutDetailsScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <Stack.Navigator initialRouteName="WelcomeScreen" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="RegisterScreen2" component={RegisterScreen2} />
            <Stack.Screen name="MainScreen" component={MainScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="FindWorkoutScreen" component={FindWorkoutScreen} />
            <Stack.Screen name="PlanScreen" component={PlanScreen} />
            <Stack.Screen name="SessionScreen" component={SessionScreen} />
            <Stack.Screen name="WorkoutDetailsScreen" component={WorkoutDetailsScreen} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
// add analyticScreen later   */

