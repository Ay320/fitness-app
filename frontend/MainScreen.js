import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWorkoutPlans } from '../store/actions';
import { ProgressCircle } from 'react-native-svg-charts';
import Icon from '@expo/vector-icons/MaterialIcons';

const MainScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, todayProgress, workouts } = useSelector(state => state);

  useEffect(() => {
    dispatch(fetchWorkoutPlans());
  }, []);

const quickActions = [
    { id: 'start', icon: 'play-arrow', label: 'Start training', screen: 'WorkoutSession' },
    { id: 'plan', icon: 'calendar-today', label: 'My plan', screen: 'PlanList' },
    { id: 'stats', icon: 'show-chart', label: 'Data statistics', screen: 'Analytics' },
  ];
return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-lg text-gray-500">welcome back</Text>
          <Text className="text-2xl font-bold">{user.name}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={{ uri: user.avatar }} 
            className="w-12 h-12 rounded-full"
          />
        </TouchableOpacity>
      </View>
