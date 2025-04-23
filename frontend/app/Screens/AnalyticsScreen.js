import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import {getWorkoutsByType,getWorkoutsByMuscleGroup,getWeightHistory,getDailyWorkoutFrequency} from '../../src/api/stats';

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = ({ token }) => {
  const [workoutTypeData, setWorkoutTypeData] = useState([]);
  const [muscleGroupData, setMuscleGroupData] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [workoutFrequency, setWorkoutFrequency] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 30); 

      const formatDate = (date) => date.toISOString().split('T')[0];
      const startDate = formatDate(pastDate);
      const endDate = formatDate(today);

      try {
        const [types, muscles, weights, frequency] = await Promise.all([
          getWorkoutsByType(token, startDate, endDate),
          getWorkoutsByMuscleGroup(token, startDate, endDate),
          getWeightHistory(token, startDate, endDate),
          getDailyWorkoutFrequency(token, startDate, endDate),
        ]);

        setWorkoutTypeData(types);
        setMuscleGroupData(muscles);
        setWeightHistory(weights);
        setWorkoutFrequency(frequency);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={styles.headerText}>📊 Stats</Text>

      <Text style={styles.sectionTitle}>Workout Type Distribution</Text>
      <BarChart
        data={{
          labels: workoutTypeData.map(item => item.type),
          datasets: [{
            data: workoutTypeData.map(item => item.count),
          }],
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        style={styles.chartStyle}
      />

      <Text style={styles.sectionTitle}>Muscle Group Distribution</Text>
      <PieChart
        data={muscleGroupData.map(item => ({
          name: item.muscle_group,
          population: item.count,
          color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        }))}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        style={styles.chartStyle}
      />

      <Text style={styles.sectionTitle}>Weight Progress</Text>
      {weightHistory.length > 0 ? (
        <LineChart
          data={{
            labels: weightHistory.map(entry => entry.date.slice(5)),
            datasets: [{ data: weightHistory.map(entry => entry.weight) }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="kg"
          chartConfig={lineChartConfig}
          bezier
          style={styles.chartStyle}
        />
      ) : <Text style={styles.noDataText}>No weight data available.</Text>}

      <Text style={styles.sectionTitle}>Workout Frequency (Daily)</Text>
      {workoutFrequency.length > 0 ? (
        <BarChart
          data={{
            labels: workoutFrequency.map(item => item.date.slice(5)),
            datasets: [{ data: workoutFrequency.map(item => item.count) }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="x"
          chartConfig={barChartConfig}
          style={styles.chartStyle}
        />
      ) : <Text style={styles.noDataText}>No workout frequency data available.</Text>}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: "#f5f5f5",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#f5f5f5",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const lineChartConfig = {
  backgroundColor: "#e26a00",
  backgroundGradientFrom: "#fb8c00",
  backgroundGradientTo: "#ffa726",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const barChartConfig = {
  backgroundColor: "#1cc910",
  backgroundGradientFrom: "#43e97b",
  backgroundGradientTo: "#38f9d7",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = {
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  chartStyle: {
    marginVertical: 10,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 10,
  },
};

export default AnalyticsScreen;
