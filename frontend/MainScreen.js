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
