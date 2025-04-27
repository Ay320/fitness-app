import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { exercises } from './Exercises';

function WorkoutDetailsScreen({ route }) {
    const {
        workoutId,
        exercise, 
        fromAddWorkout,
        onSelectExercise,
    } = route.params || {};

    const [workout, setWorkout] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (exercise) {
            // find the full exercise in the local exercises array
            const fullExercise = exercises.find(ex => String(ex.id) === String(exercise.exercise_id));
            if (fullExercise) {
                // Merge fullExercise with plan-specific recommendations
                const mergedWorkout = {
                    ...fullExercise,
                    recommendedSets: exercise.recommended_sets || fullExercise.recommendedSets,
                    recommendedReps: exercise.recommended_reps || fullExercise.recommendedReps,
                    recommendedTime: exercise.recommended_duration || fullExercise.recommendedTime,
                };
                setWorkout(mergedWorkout);
            } else {
                // Fallback to normalized workout with defaults
                const normalizedWorkout = {
                    id: exercise.exercise_id,
                    name: exercise.exercise_name || 'Unknown',
                    image: 'https://via.placeholder.com/150',
                    primMusc: exercise.primary_muscle || 'N/A',
                    secondMusc: 'N/A',
                    diffLvl: 'N/A',
                    category: exercise.category || 'N/A',
                    equipment: 'N/A',
                    recommendedSets: exercise.recommended_sets || 'N/A',
                    recommendedReps: exercise.recommended_reps || 'N/A',
                    recommendedTime: exercise.recommended_duration || 'N/A',
                    instructions: 'N/A',
                };
                setWorkout(normalizedWorkout);
            }
        } else if (workoutId) {
            // Fallback to finding workout by ID in local exercises array
            const selectedWorkout = exercises.find((ex) => ex.id === workoutId);
            setWorkout(selectedWorkout);
        }
    }, [workoutId, exercise]);

    const handleAddToSchedule = () => {
        if (onSelectExercise && workout) {
            onSelectExercise(workout);
            navigation.goBack();
        }
    };

    const handleStartWorkout = () => {
        if (workout) {
            navigation.navigate('SessionScreen', { workout });
        }
    };

    if (!workout) {
        return (
            <View style={styles.container}>
                <Text style={styles.detailText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: workout.image }} style={styles.bannerImage} />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            {fromAddWorkout && (
                <TouchableOpacity onPress={handleAddToSchedule} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            )}

            <View style={styles.detailsContainer}>
                <Text style={styles.detailTitle}>{workout.name}</Text>

                <Text style={styles.detailText}><Text style={styles.bold}>Primary Muscle:</Text> {workout.primMusc}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Secondary Muscle:</Text> {workout.secondMusc}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Difficulty:</Text> {workout.diffLvl}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Category:</Text> {workout.category}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Equipment:</Text> {workout.equipment}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Recommended Sets:</Text> {workout.recommendedSets}</Text>
                <Text style={styles.detailText}><Text style={styles.bold}>Recommended Reps:</Text> {workout.recommendedReps}</Text>
                {workout.recommendedTime !== 'N/A' && (
                    <Text style={styles.detailText}><Text style={styles.bold}>Recommended Time:</Text> {workout.recommendedTime}</Text>
                )}
                <Text style={styles.detailText}><Text style={styles.bold}>Instructions:</Text> {workout.instructions}</Text>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
                <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#222',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 10,
    },
    backButtonText: {
        color: 'white',
        fontSize: 18,
    },
    bannerImage: {
        width: '100%',
        height: 320,
        borderRadius: 10,
        marginBottom: 60,
    },
    detailsContainer: {
        backgroundColor: '#333',
        borderRadius: 15,
        padding: 20,
        marginTop: -50,
    },
    detailTitle: {
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    detailText: {
        color: '#bbb',
        fontSize: 16,
        textAlign: 'left',
        marginBottom: 12,
    },
    addButton: {
        position: 'absolute',
        top: 250,
        right: 30,
        backgroundColor: 'rgb(2, 77, 87)',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 55,
        zIndex: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: 'rgb(2, 77, 87)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bold: {
        fontWeight: 'bold',
        color: 'white',
    },
});

export default WorkoutDetailsScreen;