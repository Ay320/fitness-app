import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { exercises } from './Exercises';

const ProgressItem = ({ label, progress, value }) => (
  <View style={{ alignItems: 'center', marginVertical: 10 }}>
    <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>{label}</Text>
    <Progress.Bar progress={progress} width={200} height={10} borderRadius={5} />
    <Text style={{ color: 'white' }}>{value}</Text>
  </View>
);

const MainScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({ name: 'User', avatar: '', id: 1 });
  const [todayProgress, setTodayProgress] = useState({ calories: 0, duration: 0 });
  const [workouts, setWorkouts] = useState([]); //fetch current plan upcoming workouts
  const [streak, setStreak] = useState(0);

  const trackStreak = (completedWorkout) => {
    if (completedWorkout) {
      setStreak(prevStreak => prevStreak + 1);
    } else {
      setStreak(0);
    }
    // increment streak here
  };

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      setWorkouts(exercises.slice(0, 10)); 
      setUser({ name: 'John Doe', avatar: 'https://via.placeholder.com/150' });
      setTodayProgress({ calories: 1200, duration: 45 });
      // fetch current plan and display 
      // fetch user name and profile picture
      // fetch recent calories burned and minutes exercised
    };

    fetchWorkoutPlans();
  }, []);

  const quickActions = [
    { id: 'start', icon: 'search', screen: 'FindWorkoutScreen' },
    { id: 'plan', icon: 'calendar-month', screen: 'PlanScreen' },
    { id: 'stats', icon: 'bar-chart', screen: 'AnalyticsScreen' },
  ];


  const [recentActivity, setRecentActivity] = useState([]);

useEffect(() => {
  const fetchRecentActivity = async () => {
    setRecentActivity([
      { id: 1, name: 'Yoga', duration: 30, calories: 150, image: 'https://via.placeholder.com/100' },
      { id: 2, name: 'Strength Training', duration: 45, calories: 300, image: 'https://via.placeholder.com/100' },
    ]);
    // fetch recent activity
  };

  fetchRecentActivity();
}, []);
  return (
    <View style={styles.background}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.usernameText}>{user.name}</Text>
        </View>
        
        <View style={styles.profileContainer}>
          <View style={styles.streakContainer}>
            <Icon name="whatshot" size={32} color={streak > 0 ? 'orange' : 'gray'} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
            <Image 
              source={{ uri: 'https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=' }} 
              // replace image with users profile picture
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.recentActivityContainer}>
        <Text style = {styles.sectionTitle}> Recent Activity</Text>
        {recentActivity.length > 0 ? (
          <FlatList
              data={recentActivity}
              keyExtractor={(item,index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.activityCard}>
                  <Image source = {{uri: item.image}} style={styles.activityImage}/>
                  <View style = {styles.activityDetails}>
                    <Text style={styles.activityTitle}>{item.name}</Text>
                    <Text style={styles.activityInfo}>{item.duration} min | {item.weight} kg</Text>
                  </View>
                </View>
              )}
          />
        ):(
          <Text style={styles.noActivityText}>No recent activity. Start a workout!</Text>  
        )}
        </View>
          

        <Text style={styles.planText}>Current Plan</Text>
        
        {workouts.length === 0 ? (
          <View style={styles.noWorkoutsContainer}>
            <Text style={styles.noWorkoutsText}>No upcoming workouts found.</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('FindWorkoutScreen')}
              style={styles.findWorkoutsButton}
            >
              <Text style={styles.findWorkoutsText}>Find workouts here</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            horizontal
            data={workouts}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => navigation.navigate('SessionScreen', { id: item.id })}
                style={styles.workoutCard}
              >
                <Image source={{ uri: item.image }} style={styles.workoutImage} />
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutDescription}>{item.description}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        )}
      </View>

      <View style={styles.spacer} />

        <View style={styles.quickActionsContainer}>
          {quickActions.map(action => (
            <TouchableOpacity 
              key={action.id} 
              onPress={() => navigation.navigate(action.screen)}
              style={styles.quickActionButton}
            >
              <Icon name = {action.icon}size= {28} color ="white "/>
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
    marginBottom: 24,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  usernameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  streakText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 8,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contentContainer: {
    width: '100%',
  },
  targetText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',  
    alignItems: 'center',
    backgroundColor: '#222',  
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  quickActionButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgb(2, 77, 87)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  planText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginRight: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.1,
    width: 160,
    alignItems: 'center',
  },
  workoutImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  workoutName: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  workoutDescription: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  noWorkoutsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noWorkoutsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  findWorkoutsButton: {
    backgroundColor: 'rgb(2, 77, 87)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  findWorkoutsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentActivityContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityInfo: {
    color: '#ccc',
    fontSize: 14,
  },
  noActivityText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },  
});

export default MainScreen;
