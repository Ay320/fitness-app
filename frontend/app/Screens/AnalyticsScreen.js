import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { getWorkoutsByType, getWorkoutsByMuscleGroup, getWeightHistory, getDailyWorkoutFrequency, getWeeklyWorkoutFrequency } from '../../src/api/stats';
import { AuthContext } from '../../src/AuthContext';
import { Feather } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;

// Define consistent colors for muscle groups
const muscleGroupColors = {
  Chest: '#FFD700',
  Back: '#FF6347',
  Legs: '#32CD32',
  Arms: '#1E90FF',
  Shoulders: '#FF4500',
  Core: '#8A2BE2',
  Cardio: '#FF69B4'
};

const AnalyticsScreen = ({ navigation }) => { // Added 'navigation' prop
  const { token } = useContext(AuthContext);
  const [workoutTypeData, setWorkoutTypeData] = useState([]);
  const [muscleGroupData, setMuscleGroupData] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [dailyFrequencyData, setDailyFrequencyData] = useState([]);
  const [weeklyFrequencyData, setWeeklyFrequencyData] = useState([]);
  const [frequencyGranularity, setFrequencyGranularity] = useState('daily');
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

  if (loading) return <ActivityIndicator size="large" color="#fff" style={styles.centered} />;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>📊 Your Fitness Analytics</Text>
        </View>

        {/* Workout Type Distribution Chart */}
        <Text style={styles.sectionTitle}>Workout Type Distribution</Text>
        <Text style={styles.explanationText}>This chart shows the number of workouts by type (e.g., Strength, Cardio) over the past 30 days.</Text>
        <View style={styles.chartContainer}>
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
          />
        </View>

        {/* Muscle Group Focus Chart */}
        <Text style={styles.sectionTitle}>Muscle Group Focus</Text>
        <Text style={styles.explanationText}>This pie chart highlights the distribution of your workouts across different muscle groups over the past 30 days.</Text>
        <View style={styles.chartContainer}>
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
            chartConfig={pieChartConfig}
            accessor="population"
            style={styles.chartStyle}
          />
        </View>

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
        ) : (
          <Text style={styles.noDataText}>No weight data available for the past 30 days.</Text>
        )}

        {/* Workout Frequency Chart */}
        <Text style={styles.sectionTitle}>Workout Frequency ({frequencyGranularity})</Text>
        <Text style={styles.explanationText}>This bar chart displays how often you’ve worked out each {frequencyGranularity === 'daily' ? 'day' : 'week'} over the past 30 days.</Text>
        {frequencyData.length > 0 && (
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: frequencyData.map(item => frequencyGranularity === 'daily' ? item.date.slice(5) : `W${item.week}-${item.year}`),
                datasets: [{ data: frequencyData.map(item => item.count || 0) }],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={barChartConfig}
              style={styles.chartStyle}
              fromZero={true}
            />
          </View>
        )}

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
    </View>
  );
};

const chartConfig = {
  backgroundColor: "#222",
  backgroundGradientFrom: "#333",
  backgroundGradientTo: "#222",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
  },
  decimalPlaces: 0,
};

const pieChartConfig = {
  backgroundColor: "#222", 
  backgroundGradientFrom: "#333", 
  backgroundGradientTo: "#222", 
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
  backgroundGradientFrom: "#228B22",
  backgroundGradientTo: "#06402B",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
  },
  barPercentage: 0.5,
  decimalPlaces: 0,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: 'white',
  },
  explanationText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 10,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartStyle: {
    borderRadius: 16,
  },
  noDataText: {
    color: 'gray',
    fontSize: 16,
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
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnalyticsScreen;
