import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getActivePlan, getPlanDays, getPlanExercises } from '../../src/api/plans';
import { getWorkoutLogs } from '../../src/api/workouts';
import { syncUser } from '../../src/api/authApi';
import { getUserStreak } from '../../src/api/user';
import { AuthContext } from '../../src/AuthContext';
import { exercises } from './Exercises'; // Import local exercises for image lookup

const { width } = Dimensions.get('window');
const pairWidth = width - 48; // Narrower width to show part of the next pair
const visibleMargin = 1; // Space to reveal a portion of the next pair

const MainScreen = () => {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState({ name: '', avatar: '', id: 1 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to format date to 'YYYY-MM-DD' in local time zone
  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to calculate streak based on workout logs
  const calculateStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;

    // Extract unique local dates from logs
    const workoutDates = logs.map((log) => formatLocalDate(log.date_logged));
    const uniqueDates = [...new Set(workoutDates)].sort((a, b) => new Date(b) - new Date(a));

    // Get today's date in local time zone
    const today = new Date();
    const todayStr = formatLocalDate(today);

    let streak = 0;
    let currentDate = new Date(today);

    // Check consecutive days starting from today
    while (uniqueDates.includes(formatLocalDate(currentDate))) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await syncUser(token);
        setUser(userData);

        const logs = await getWorkoutLogs(token);
        const sortedLogs = logs.sort((a, b) => new Date(b.date_logged) - new Date(a.date_logged));
        setRecentActivity(sortedLogs);

        // Calculate streak locally
        const localStreak = calculateStreak(sortedLogs);
        setStreak(localStreak);

        const activePlanData = await getActivePlan(token);
        setActivePlan(activePlanData);

        if (activePlanData) {
          const planDays = await getPlanDays(token, activePlanData.plan_id);
          const workouts = await Promise.all(
            planDays.map(async (day) => {
              const exercises = await getPlanExercises(token, activePlanData.plan_id, day.plan_day_id);
              return { day: day.day_number, exercises };
            })
          );
          setUpcomingWorkouts(workouts);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Group recent activities into pairs for swipeable cards
  const groupedRecentActivities = [];
  for (let i = 0; i < recentActivity.length; i += 2) {
    groupedRecentActivities.push(recentActivity.slice(i, i + 2));
  }

  const renderSwipeableActivityPair = ({ item, index }) => (
    <View key={`pair-${index}`} style={styles.activityPairContainer}>
      {item.map((activity, activityIndex) => {
        // Find the exercise in the local exercises array to get the image
        const fullExercise = exercises.find(ex => String(ex.id) === String(activity.exercise_id));
        const imageUrl = fullExercise ? fullExercise.image : 'https://via.placeholder.com/50'; // Fallback image
        return (
          <View
            key={`activity-${activity.workout_log_id || activityIndex}`}
            style={styles.activityCard}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.activityImage}
            />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>{activity.exercise_name}</Text>
              <Text style={styles.activityDate}>
                {new Date(activity.date_logged).toLocaleDateString()}
              </Text>
            </View>
          </View>
        );
      })}
      {item.length === 1 && <View key="placeholder" style={styles.activityCardPlaceholder} />}
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="white"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  return (
    <View style={styles.background}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.usernameText}>{user.name}</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.streakContainer}>
            <Icon
              name="whatshot"
              size={35}
              color={streak > 0 ? 'orange' : 'gray'}
            />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image
              source={{
                uri:
                  user.avatar ||
                  'https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={styles.contentContainer}>
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            <FlatList
              data={groupedRecentActivities}
              keyExtractor={(item, index) => `pair-${index}`}
              renderItem={renderSwipeableActivityPair}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
              style={{ maxHeight: 250 }}
              initialNumToRender={2}
              snapToInterval={pairWidth + visibleMargin} // Snap to show part of next pair
              decelerationRate="fast"
            />
          ) : (
            <Text style={styles.noActivityText}>No recent activity. Start a workout!</Text>
          )}
        </View>

        <Text style={styles.planText}>Upcoming Workouts</Text>
        {upcomingWorkouts.length > 0 ? (
          <FlatList
            data={upcomingWorkouts}
            keyExtractor={(item) => item.day.toString()}
            renderItem={({ item }) => (
              <View style={styles.scrollDayCard}>
                <Text style={styles.workoutDayTitle}>Day {item.day}</Text>
                {item.exercises.map((exercise) => {
                  // Find the exercise in the local exercises array to get the image
                  const fullExercise = exercises.find(ex => String(ex.id) === String(exercise.exercise_id));
                  const imageUrl = fullExercise ? fullExercise.image : 'https://via.placeholder.com/50'; // Fallback image
                  return (
                    <TouchableOpacity
                      key={exercise.plan_exercise_id}
                      style={styles.scrollWorkoutCard}
                      onPress={() => navigation.navigate('WorkoutDetailsScreen', { exercise })}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.workoutImage}
                      />
                      <View style={styles.workoutText}>
                        <Text style={styles.workoutName}>{exercise.exercise_name}</Text>
                        <Text style={styles.workoutDescription}>
                          {exercise.recommended_sets} sets x {exercise.recommended_reps} reps
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            style={{ maxHeight: 950 }}
          />
        ) : (
          <Text style={styles.noWorkoutsText}>No upcoming workouts found.</Text>
        )}
      </ScrollView>

      <View style={styles.quickActionsContainer}>
        {[
          { id: 'start', icon: 'search', screen: 'FindWorkoutScreen' },
          { id: 'plan', icon: 'calendar-month', screen: 'PlanScreen' },
          { id: 'stats', icon: 'bar-chart', screen: 'AnalyticsScreen' },
        ].map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => navigation.navigate(action.screen)}
            style={styles.quickActionButton}
          >
            <Icon name={action.icon} size={28} color="white" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#2a2a2a',
  },
  welcomeText: {
    fontSize: 20,
    color: '#aaa',
    marginTop:'10'
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  streakText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  recentActivityContainer: {
    width: width - 40,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  activityPairContainer: {
    width: pairWidth, // Narrower container width
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: visibleMargin, // Space for next pair visibility
  },
  activityCard: {
    flexDirection: 'row', // Layout image and text side by side
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    width: (pairWidth - 20) / 2, // Adjusted card width
    marginRight: 10,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
    marginRight: 10,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  activityDate: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  activityCardPlaceholder: {
    width: (pairWidth - 20) / 2,
    marginRight: 10,
  },
  noActivityText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  planText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    width: width - 40,
    marginVertical: 10,
  },
  scrollDayCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginRight: 20,
    width: width - 40,
  },
  workoutDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  scrollWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  workoutImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
    marginRight: 10,
  },
  workoutText: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  noWorkoutsText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    width: width - 40,
  },
  quickActionsContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width - 40,
  },
  quickActionButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainScreen;