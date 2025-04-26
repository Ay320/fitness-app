import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { 
  getWorkoutsByType, 
  getWorkoutsByMuscleGroup, 
  getWeightHistory, 
  getDailyWorkoutFrequency, 
  getWeeklyWorkoutFrequency 
} from '../../src/api/stats';
import { AuthContext } from '../../src/AuthContext';

const screenWidth = Dimensions.get("window").width;

// Define consistent colors for muscle groups
const muscleGroupColors = {
  Chest: '#FFD700', // Yellow
  Back: '#FF6347',  // Tomato
  Legs: '#32CD32',  // LimeGreen
  Arms: '#1E90FF',  // DodgerBlue
  Shoulders: '#FF4500', // OrangeRed
  Core: '#8A2BE2',  // BlueViolet
  Cardio: '#FF69B4' // HotPink
};

const AnalyticsScreen = () => {
  const { token } = useContext(AuthContext);
  const [workoutTypeData, setWorkoutTypeData] = useState([]);
  const [muscleGroupData, setMuscleGroupData] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [dailyFrequencyData, setDailyFrequencyData] = useState([]);
  const [weeklyFrequencyData, setWeeklyFrequencyData] = useState([]);
  const [frequencyGranularity, setFrequencyGranularity] = useState('daily'); // 'daily' or 'weekly'
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
        const [types, muscles, weights, dailyFrequency, weeklyFrequency] = await Promise.all([
          getWorkoutsByType(token, startDate, endDate),
          getWorkoutsByMuscleGroup(token, startDate, endDate),
          getWeightHistory(token, startDate, endDate),
          getDailyWorkoutFrequency(token, startDate, endDate),
          getWeeklyWorkoutFrequency(token, startDate, endDate),
        ]);

        setWorkoutTypeData(types);
        setMuscleGroupData(muscles);
        setWeightHistory(weights);
        setDailyFrequencyData(dailyFrequency);
        setWeeklyFrequencyData(weeklyFrequency);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const frequencyData = frequencyGranularity === 'daily' ? dailyFrequencyData : weeklyFrequencyData;

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={styles.headerText}>📊 Your Fitness Analytics</Text>

      {/* Workout Type Distribution Chart */}
      <Text style={styles.sectionTitle}>Workout Type Distribution</Text>
      <Text style={styles.explanationText}>This chart shows the number of workouts by type (e.g., Strength, Cardio) over the past 30 days.</Text>
      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabelContainer}>
          <Text style={styles.yAxisLabel}>Workouts</Text>
        </View>
        <BarChart
          data={{
            labels: workoutTypeData.map(item => item.type || 'Unknown'),
            datasets: [{ data: workoutTypeData.map(item => item.count || 0) }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chartStyle}
          fromZero={true}
          withInnerLines={true}
        />
      </View>

      {/* Muscle Group Focus Chart */}
      <Text style={styles.sectionTitle}>Muscle Group Focus</Text>
      <Text style={styles.explanationText}>This pie chart highlights the distribution of your workouts across different muscle groups over the past 30 days.</Text>
      <PieChart
        data={muscleGroupData.map(item => ({
          name: item.muscle_group || 'Unknown',
          population: item.count || 0,
          color: muscleGroupColors[item.muscle_group] || '#ccc',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        }))}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        style={styles.chartStyle}
      />

      {/* Weight Progress Over Time Chart */}
      <Text style={styles.sectionTitle}>Weight Progress Over Time</Text>
      <Text style={styles.explanationText}>This line chart tracks your weight changes over the past 30 days to show your progress.</Text>
      {weightHistory.length > 0 ? (
        <LineChart
          data={{
            labels: weightHistory.map(entry => entry.date ? entry.date.slice(5) : 'No Date'),
            datasets: [{ data: weightHistory.map(entry => entry.weight || 0) }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="kg"
          chartConfig={lineChartConfig}
          bezier
          style={styles.chartStyle}
        />
      ) : <Text style={styles.noDataText}>No weight data available for the past 30 days.</Text>}

      {/* Workout Frequency Chart */}
      <Text style={styles.sectionTitle}>Workout Frequency ({frequencyGranularity})</Text>
      <Text style={styles.explanationText}>This bar chart displays how often you’ve worked out each {frequencyGranularity === 'daily' ? 'day' : 'week'} over the past 30 days.</Text>
      {frequencyData.length > 0 && (
        frequencyData[0].hasOwnProperty(frequencyGranularity === 'daily' ? 'date' : 'week')
      ) ? (
        <View style={styles.chartContainer}>
          <View style={styles.yAxisLabelContainer}>
            <Text style={styles.yAxisLabel}>Workouts</Text>
          </View>
          <BarChart
            data={{
              labels: frequencyData.map(item => {
                if (frequencyGranularity === 'daily') {
                  return item.date ? item.date.slice(5) : 'No Date';
                } else {
                  const week = item.week !== undefined ? item.week : 'N/A';
                  const year = item.year !== undefined ? item.year : 'N/A';
                  return `W${week}-${year}`;
                }
              }),
              datasets: [{
                data: frequencyData.map(item => item.count || 0),
              }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={barChartConfig}
            style={styles.chartStyle}
            fromZero={true}
            withInnerLines={true}
          />
        </View>
      ) : (
        <Text style={styles.noDataText}>
          No workout frequency data available for the past 30 days.
        </Text>
      )}

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={frequencyGranularity === 'daily' ? styles.activeButton : styles.inactiveButton}
          onPress={() => setFrequencyGranularity('daily')}
        >
          <Text style={styles.buttonText}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={frequencyGranularity === 'weekly' ? styles.activeButton : styles.inactiveButton}
          onPress={() => setFrequencyGranularity('weekly')}
        >
          <Text style={styles.buttonText}>Weekly</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Chart configurations
const chartConfig = {
  backgroundColor: "#f5f5f5",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#f5f5f5",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
  },
  decimalPlaces: 0,
};

const lineChartConfig = {
  backgroundColor: "#e26a00",
  backgroundGradientFrom: "#fb8c00",
  backgroundGradientTo: "#ffa726",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
  },
};

const barChartConfig = {
  backgroundColor: "#1cc910",
  backgroundGradientFrom: "#43e97b",
  backgroundGradientTo: "#38f9d7",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
  },
  barPercentage: 0.5,
  decimalPlaces: 0,
};

// Styles
const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  yAxisLabelContainer: {
    position: 'absolute',
    left: -40, // Position the label to the left of the chart
    top: '30%', // Center vertically
    height: 100, // Enough height to accommodate the rotated text
    justifyContent: 'center',
  },
  yAxisLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
    textAlign: 'center',
  },
  chartStyle: {
    marginVertical: 10,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 10,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  activeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  inactiveButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AnalyticsScreen;