import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { exercises } from './Exercises';

export default function FindWorkoutScreen({ route }) {
  const navigation = useNavigation();
  const { onSelectExercise } = route.params || {};
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [favourites, setFavourites] = useState([]);
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState(exercises);

  const screenWidth = Dimensions.get('window').width;
  const pickerWidth = (screenWidth - 40 - 50) / 3; // 20px padding on each side + 50px for fav star

  useEffect(() => {
    const results = exercises.filter(ex =>
      ex.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'All' || ex.category === filter) &&
      (muscleFilter === 'All' || ex.primMusc === muscleFilter || ex.secondMusc === muscleFilter) &&
      (difficultyFilter === 'All' || ex.diffLvl === difficultyFilter) &&
      (!favouritesOnly || favourites.includes(ex.id))
    );
    setFilteredExercises(results);
  }, [search, filter, muscleFilter, difficultyFilter, favouritesOnly, favourites]);

  const toggleFavourite = id =>
    setFavourites(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );

  const handleSelectWorkout = workout => {
    navigation.navigate('WorkoutDetailsScreen', {
      workoutId: workout.id,
      fromAddWorkout: !!onSelectExercise,
      onSelectExercise,
    });
  };

  return (
    <View style={styles.background}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Workouts</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search for an exercise..."
        placeholderTextColor="white"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filtersContainer}>
        <View style={[styles.filterItem, { width: pickerWidth }]}>
          <Text style={styles.filterLabel}>Category</Text>
          <Picker
            selectedValue={filter}
            mode="dropdown"
            dropdownIconColor="white"
            style={styles.picker}
            onValueChange={setFilter}
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Strength" value="Strength" />
            <Picker.Item label="Cardio" value="Cardio" />
            <Picker.Item label="Balance" value="Balance" />
          </Picker>
        </View>

        <View style={[styles.filterItem, { width: pickerWidth }]}>
          <Text style={styles.filterLabel}>Muscle</Text>
          <Picker
            selectedValue={muscleFilter}
            mode="dropdown"
            dropdownIconColor="white"
            style={styles.picker}
            onValueChange={setMuscleFilter}
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Chest" value="Chest" />
            <Picker.Item label="Triceps" value="Triceps" />
            <Picker.Item label="Back" value="Back" />
            <Picker.Item label="Legs" value="Legs" />
            <Picker.Item label="Biceps" value="Biceps" />
            <Picker.Item label="Core" value="Core" />
            <Picker.Item label="Shoulders" value="Shoulders" />
            <Picker.Item label="Cardio" value="Cardio" />
          </Picker>
        </View>

        <View style={[styles.filterItem, { width: pickerWidth }]}>
          <Text style={styles.filterLabel}>Difficulty</Text>
          <Picker
            selectedValue={difficultyFilter}
            mode="dropdown"
            dropdownIconColor="white"
            style={styles.picker}
            onValueChange={setDifficultyFilter}
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Beginner" value="Beginner" />
            <Picker.Item label="Intermediate" value="Intermediate" />
            <Picker.Item label="Advanced" value="Advanced" />
          </Picker>
        </View>

        <TouchableOpacity
          onPress={() => setFavouritesOnly(prev => !prev)}
          style={styles.favoriteButton}
        >
          <Text style={[styles.favouriteStar, favouritesOnly && styles.activeStar]}>
            {favouritesOnly ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.workoutItem}
            onPress={() => handleSelectWorkout(item)}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.exerciseName}>{item.name}</Text>
            <TouchableOpacity onPress={() => toggleFavourite(item.id)}>
              <Text style={styles.favouriteText}>
                {favourites.includes(item.id) ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  header: {
    color: 'white',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#222',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  filterItem: {
    alignItems: 'center',
  },
  filterLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  picker: {
    color: 'white',
    height: 40,
    width: '100%',
    backgroundColor: '#222',
  },
  favoriteButton: {
    paddingHorizontal: 10,
    marginTop: 16,
  },
  favouriteStar: {
    fontSize: 24,
    color: 'gray',
  },
  activeStar: {
    color: 'gold',
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  exerciseName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  favouriteText: {
    color: 'gold',
    fontSize: 24,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});