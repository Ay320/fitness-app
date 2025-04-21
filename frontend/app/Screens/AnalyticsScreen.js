import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = ({ token }) => {
  const [workoutTypeData, setWorkoutTypeData] = useState([]);
  const [muscleGroupData, setMuscleGroupData] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [workoutFrequency, setWorkoutFrequency] = useState([]);
  const [loading, setLoading] = useState(true);

  const startDate = '2025-03-01';
  const endDate = '2025-04-20';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [typeRes, muscleRes, weightRes, freqRes] = await Promise.all([
          axios.get(`http://<YOUR_API_URL>/workouts/by-type?start_date=${startDate}&end_date=${endDate}`, config),
          axios.get(`http://<YOUR_API_URL>/workouts/by-muscle-group?start_date=${startDate}&end_date=${endDate}`, config),
          axios.get(`http://<YOUR_API_URL>/weight/history?start_date=${startDate}&end_date=${endDate}`, config),
          axios.get(`http://<YOUR_API_URL>/workouts/frequency?start_date=${startDate}&end_date=${endDate}&granularity=daily`, config),
        ]);

        setWorkoutTypeData(typeRes.data);
        setMuscleGroupData(muscleRes.data);
        setWeightHistory(weightRes.data);
        setWorkoutFrequency(freqRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>📊 Stats</Text>

      <Text style={{ fontSize: 18, marginVertical: 10 }}>Workout Type Distribution</Text>
      {workoutTypeData.map(item => (
        <Text key={item.type}>{item.type}: {item.count}</Text>
      ))}

      <Text style={{ fontSize: 18, marginVertical: 10 }}>Muscle Group Distribution</Text>
      {muscleGroupData.map(item => (
        <Text key={item.muscle_group}>{item.muscle_group}: {item.count}</Text>
      ))}

      <Text style={{ fontSize: 18, marginVertical: 10 }}>Weight Progress</Text>
      <LineChart
        data={{
          labels: weightHistory.map(entry => entry.date),
          datasets: [{ data: weightHistory.map(entry => entry.weight) }]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="kg"
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        bezier
        style={{ marginVertical: 10, borderRadius: 16 }}
      />

      <Text style={{ fontSize: 18, marginVertical: 10 }}>Workout Frequency (Daily)</Text>
      <BarChart
        data={{
          labels: workoutFrequency.map(item => item.date),
          datasets: [{ data: workoutFrequency.map(item => item.count) }]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="x"
        chartConfig={{
          backgroundColor: "#1cc910",
          backgroundGradientFrom: "#43e97b",
          backgroundGradientTo: "#38f9d7",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{ marginVertical: 10, borderRadius: 16 }}
      />
    </ScrollView>
  );
};

export default AnalyticsScreen;
