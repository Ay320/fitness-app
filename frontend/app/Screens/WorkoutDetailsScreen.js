import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { exercises } from './Exercises';

function WorkoutDetailsScreen({ route }) {
    const { workoutId, favourites: initialFavourites, toggleFavourite } = route.params;
    const [favourites, setFavourites] = useState(initialFavourites || []);
    const [workout, setWorkout] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const selectedWorkout = exercises.find(exercise => exercise.id === workoutId);
        setWorkout(selectedWorkout);
    }, [workoutId]);

    const handleToggleFavourite = (workoutId) => {
        const updatedFavourites = favourites.includes(workoutId)
            ? favourites.filter(id => id !== workoutId)
            : [...favourites, workoutId];
        setFavourites(updatedFavourites);
        toggleFavourite(workoutId);
    };

    const handleAddToSchedule = () => {
        navigation.navigate('PlanScreen', { workout });
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

            <TouchableOpacity onPress={handleAddToSchedule} style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

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

                <TouchableOpacity onPress={() => handleToggleFavourite(workout.id)}>
                    <Text style={styles.favouriteText}>
                        {favourites.includes(workout.id) ? '★ Remove from Favourites' : '☆ Add to Favourites'}
                    </Text>
                </TouchableOpacity>
            </View>
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
        height: 250,
        borderRadius: 10,
        marginBottom: 20,
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
    favouriteText: {
        color: 'gold',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
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
    bold: {
        fontWeight: 'bold',
        color: 'white',
    },
});

export default WorkoutDetailsScreen;
