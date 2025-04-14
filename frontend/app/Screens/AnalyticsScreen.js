import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function AnalyticsScreen(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Data Statistics</Text>
            <Text style={styles.description}>Analyse your fitness progress over time.</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    description: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
  });

export default AnalyticsScreen;