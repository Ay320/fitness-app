import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DayItem = ({ day }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleDay = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.dayContainer}>
      <TouchableOpacity onPress={toggleDay} style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{day.day}</Text>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="white" />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.exercisesList}>
          {day.exercises.map((exercise) => (
            <Text key={exercise.id} style={styles.exerciseText}>
              {exercise.name}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    backgroundColor: '#222',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exercisesList: {
    marginTop: 10,
  },
  exerciseText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default DayItem;