import React, { useEffect, useState, useContext } from 'react';
import {View,Text,FlatList,TouchableOpacity,Image,StyleSheet,ActivityIndicator,ScrollView,Dimensions,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getActivePlan,getPlanDays,getPlanExercises,} from '../../src/api/plans';
import { getWorkoutLogs } from '../../src/api/workouts';
import { syncUser } from '../../src/api/authApi';
import { getUserStreak } from '../../src/api/user'; 
import { AuthContext } from '../../src/AuthContext';

const { width } = Dimensions.get('window');

const MainScreen = () => {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState({ name: '', avatar: '', id: 1 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
  const [streak, setStreak] = useState(0); // Streak state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await syncUser(token);
        setUser(userData);

        // Fetch user streak data
        const streakData = await getUserStreak(token);
        setStreak(streakData.current_streak); // Set streak from the response

        const logs = await getWorkoutLogs(token);
        const sortedLogs = logs.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setRecentActivity(sortedLogs);

        const activePlanData = await getActivePlan(token);
        setActivePlan(activePlanData);

        if (activePlanData) {
          const planDays = await getPlanDays(token, activePlanData.plan_id);
          const workouts = await Promise.all(
            planDays.map(async (day) => {
              const exercises = await getPlanExercises(
                token,
                activePlanData.plan_id,
                day.plan_day_id
              );
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

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="white"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  const renderActivity = ({ item }) => (
    <View style={styles.activityCard}>
      <Image
        source={{
          uri: item.image || 'https://via.placeholder.com/60',
        }}
        style={styles.activityImage}
      />
      <View style={styles.activityDetails}>
        <Text style={styles.activityTitle}>{item.exercise_name || 'Workout'}</Text>
        <Text style={styles.activityInfo}>
          {item.duration || 0} min | {item.calories_burned || 0} kcal
        </Text>
      </View>
    </View>
  );

  const renderSwipeableActivityPair = ({ item }) => (
    <View style={styles.activityPairContainer}>
      <View style={styles.activityStack}>
        <View style={styles.activityCard}>
          <Image
            source={{
              uri: item[0]?.image || 'https://via.placeholder.com/60',
            }}
            style={styles.activityImage}
          />
          <View style={styles.activityDetails}>
            <Text style={styles.activityTitle}>{item[0]?.exercise_name || 'Workout'}</Text>
            <Text style={styles.activityInfo}>
              {item[0]?.duration || 0} min | {item[0]?.calories_burned || 0} kcal
            </Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          <Image
            source={{
              uri: item[1]?.image || 'https://via.placeholder.com/60',
            }}
            style={styles.activityImage}
          />
          <View style={styles.activityDetails}>
            <Text style={styles.activityTitle}>{item[1]?.exercise_name || 'Workout'}</Text>
            <Text style={styles.activityInfo}>
              {item[1]?.duration || 0} min | {item[1]?.calories_burned || 0} kcal
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const groupedRecentActivities = [];
  for (let i = 0; i < recentActivity.length; i += 2) {
    groupedRecentActivities.push(recentActivity.slice(i, i + 2));
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
              size={32}
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

      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            <FlatList
              data={groupedRecentActivities} 
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSwipeableActivityPair}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
              style={{ maxHeight: 250 }}
              initialNumToRender={2}
              snapToInterval={width - 40}
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
                {item.exercises.map((exercise) => (
                  <View
                    key={exercise.plan_exercise_id}
                    style={styles.scrollWorkoutCard}
                  >
                    <Text style={styles.workoutName}>
                      {exercise.exercise_name}
                    </Text>
                    <Text style={styles.workoutDescription}>
                      {exercise.recommended_sets} sets x{' '}
                      {exercise.recommended_reps} reps
                    </Text>
                  </View>
                ))}
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            style={{ maxHeight: 250 }}
          />
        ) : (
          <Text style={styles.noWorkoutsText}>
            No upcoming workouts found.
          </Text>
        )}
      </ScrollView>

      <View style={styles.quickActionsContainer}>
        {[{ id: 'start', icon: 'search', screen: 'FindWorkoutScreen' },
          { id: 'plan', icon: 'calendar-month', screen: 'PlanScreen' },
          { id: 'stats', icon: 'bar-chart', screen: 'AnalyticsScreen' }].map((action) => (
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
    backgroundColor: 'rgb(0, 0, 0)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  usernameText: {
    fontSize: 20,
    color: 'white',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  streakText: {
    color: 'white',
    fontSize: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  recentActivityContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  activityPairContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width - 40,
  },
  activityStack: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10, // Space between stacked activities
    width: width - 100, // Shortened width
    height: 100, // Shortened height
  },
  activityImage: {
    width: 50, // Adjust image size for shorter card
    height: 50, // Adjust image size for shorter card
    borderRadius: 25,
  },
  activityDetails: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14, // Adjust title size for shorter card
    color: 'white',
  },
  activityInfo: {
    color: 'gray',
    fontSize: 12, // Adjust text size for shorter card
  },
  noActivityText: {
    color: 'white',
    fontSize: 16,
  },
  planText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 10,
  },
  noWorkoutsText: {
    color: 'white',
    fontSize: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  quickActionButton: {
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 50,
  },
  scrollDayCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    width: 250,
  },
  scrollWorkoutCard: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  workoutDayTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutName: {
    color: 'white',
    fontSize: 16,
  },
  workoutDescription: {
    color: 'gray',
    fontSize: 14,
  },
});

export default MainScreen;
