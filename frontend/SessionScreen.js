import React, { useState, useEffect } from 'react';
import { TouchableOpacity, TextInput, StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { exercises } from './Exercises';

const InputControl = ({ label, value, setValue }) => {
    const increaseValue = () => setValue((prev) => prev + 1);
    const decreaseValue = () => setValue((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <View style={styles.inputRow}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity onPress={decreaseValue}>
                <Icon name="remove-circle-outline" size={24} color="white" />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                value={String(value)}
                keyboardType="numeric"
                onChangeText={(text) => {
                    const num = Number(text);
                    setValue(num > 0 ? num : 1);
                }}
            />
            <TouchableOpacity onPress={increaseValue}>
                <Icon name="add-circle-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

function SessionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);
    const [weight, setWeight] = useState(20);
    const [exerciseDetails, setExerciseDetails] = useState(null);
    const [workoutStarted, setWorkoutStarted] = useState(false);
    const [completedSets, setCompletedSets] = useState(new Array(sets).fill(false)); 
    useEffect(() => {
        const exercise = exercises.find(exercise => exercise.id === id);
        setExerciseDetails(exercise);
    }, [id]);

    const handleStart = () => {
        setWorkoutStarted(true);
    };

    const handleCompleteWorkout = () => {
        console.log('Workout completed!');
    };

    const toggleSetCompletion = (index) => {
        const newCompletedSets = [...completedSets];
        newCompletedSets[index] = !newCompletedSets[index]; 
        setCompletedSets(newCompletedSets);
    };

    const isValid = sets > 0 && reps > 0 && weight > 0;
    const allSetsCompleted = completedSets.every(set => set); 

    if (!exerciseDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: exerciseDetails.image }} style={styles.bannerImage} />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('WorkoutDetailsScreen', { workoutId: id })} style={styles.infoButton}>
                <Icon name="info-outline" size={28} color="white" />
            </TouchableOpacity>

            {!workoutStarted ? (
                <View style={styles.inputContainer}>
                    <View style={styles.inputBox}>
                        <InputControl label="Sets" value={sets} setValue={setSets} />
                        <InputControl label="Reps" value={reps} setValue={setReps} />
                        <InputControl label="Weight (kg)" value={weight} setValue={setWeight} />
                    </View>
                </View>
            ) : (
                <View style={styles.workoutContainer}>
                    <Text style={styles.instructions}>Follow the workout instructions below:</Text>
                    <Text style={styles.instructions}>{exerciseDetails.instructions}</Text>
                    <Text style={styles.instructions}>- Do this for {reps} reps per set with {weight} kg</Text>

                    <View style={styles.setsContainer}>
                        {Array.from({ length: sets }).map((_, index) => (
                            <TouchableOpacity key={index} style={styles.setWrapper} onPress={() => toggleSetCompletion(index)}>
                                <Text style={styles.circleNumber}>{index + 1}</Text>
                                <View style={styles.circle}>
                                    <Icon
                                        name={completedSets[index] ? 'check-circle' : 'cancel'}
                                        size={24}
                                        color="white"
                                        style={styles.icon}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {!workoutStarted ? (
                <TouchableOpacity style={[styles.startButton, !isValid && styles.disabledButton]} onPress={handleStart}>
                    <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.startButton, !allSetsCompleted && styles.disabledButton]}
                    onPress={handleCompleteWorkout}
                    disabled={!allSetsCompleted}
                >
                    <Text style={styles.startButtonText}>Complete Workout</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 20,
    },
    backButtonText: {
        color: 'white',
        fontSize: 18,
    },
    infoButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 20,
    },
    inputContainer: {
        backgroundColor: '#333',
        borderRadius: 15,
        padding: 20,
        marginTop: -50,
        paddingBottom: -10,
    },
    inputBox: {
        backgroundColor: '#333',
        borderRadius: 15,
        padding: 15,
        width: '100%',
        zIndex: 2,
        marginTop: -20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 4,
        paddingHorizontal: 5,
    },
    label: {
        color: 'white',
        fontSize: 18,
        flex: 1,
    },
    input: {
        width: 50,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        marginHorizontal: 8,
    },
    startButton: {
        width: '70%',
        height: 60,
        backgroundColor: 'rgb(2, 77, 87)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        borderRadius: 30,
        alignSelf: 'center',
    },
    startButtonText: {
        color: 'white',
        fontSize: 20,
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    bannerImage: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        marginBottom: 20,
    },
    loadingText: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
    },
    workoutContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    instructions: {
        color: 'white',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    setsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    setWrapper: {
        alignItems: 'center',
        margin: 10,
    },
    circleNumber: {
        color: 'rgb(2, 77, 87)',
        fontSize: 26,
        marginBottom: 5,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgb(2, 77, 87)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        position: 'absolute',
    },
});

export default SessionScreen;
