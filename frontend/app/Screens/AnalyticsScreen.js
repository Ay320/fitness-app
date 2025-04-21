import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = ({ token }) => {
  const [workoutTypeData, setWorkoutTypeData] = useState([]);
  const [muscleGroupData, setMuscleGroupData] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [workoutFrequency, setWorkoutFrequency] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setWorkoutTypeData([
        { type: 'Cardio', count: 8 },
        { type: 'Strength', count: 12 },
        { type: 'Flexibility', count: 5 },
      ]);

      setMuscleGroupData([
        { muscle_group: 'Chest', count: 6 },
        { muscle_group: 'Back', count: 7 },
        { muscle_group: 'Legs', count: 5 },
        { muscle_group: 'Arms', count: 4 },
      ]);

      setWeightHistory([
        { date: '2025-03-01', weight: 70 },
        { date: '2025-03-10', weight: 69.5 },
        { date: '2025-03-20', weight: 69 },
        { date: '2025-03-30', weight: 68.8 },
        { date: '2025-04-10', weight: 68.5 },
      ]);

      setWorkoutFrequency([
        { date: '2025-04-01', count: 1 },
        { date: '2025-04-02', count: 0 },
        { date: '2025-04-03', count: 1 },
        { date: '2025-04-04', count: 2 },
        { date: '2025-04-05', count: 1 },
        { date: '2025-04-06', count: 1 },
        { date: '2025-04-07', count: 0 },
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

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
        chartConfig={{
          backgroundColor: "#f5f5f5",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#f5f5f5",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
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
        chartConfig={{
          backgroundColor: "#ffffff",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
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
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
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
          yAxisLabel=""
          yAxisSuffix="x"
          chartConfig={{
            backgroundColor: "#1cc910",
            backgroundGradientFrom: "#43e97b",
            backgroundGradientTo: "#38f9d7",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chartStyle}
        />
      ) : <Text style={styles.noDataText}>No workout frequency data available.</Text>}
    </ScrollView>
  );
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
