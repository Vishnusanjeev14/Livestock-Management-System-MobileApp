// livestock-management-mobile/components/Dashboard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native'; // Import Button
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Dashboard = () => {
  const navigation = useNavigation();
  const { logout } = useAuth(); // Get the logout function

  const quickActions = [
    // ... (keep your existing quickActions array)
    { title: 'Animals', description: 'Manage your livestock', link: 'Animals', color: '#007bff' },
    { title: 'Breeding', description: 'Track breeding records', link: 'Breeding', color: '#28a745' },
    { title: 'Feeding', description: 'Record feeding schedules', link: 'Feeding', color: '#ffc107' },
    { title: 'Health', description: 'Monitor health records', link: 'Health', color: '#dc3545' },
    { title: 'Production', description: 'Track production data', link: 'Production', color: '#6f42c1' },
    { title: 'Veterinary', description: 'Schedule treatments', link: 'Veterinary', color: '#fd7e14' },
    { title: 'Sales', description: 'Manage animal & product sales', link: 'Sales', color: '#20c997' },
    { title: 'Inventory', description: 'Track feed and supplies', link: 'Inventory', color: '#6c757d' },
    { title: 'Finance', description: 'Monitor expenses and income', link: 'Finance', color: '#e83e8c' },
    { title: 'Staff', description: 'Manage employees and tasks', link: 'Staff', color: '#17a2b8' },
    { title: 'Environment', description: 'Monitor weather and conditions', link: 'Environment', color: 'magenta' },
    { title: 'Scheduler', description: 'Set reminders and tasks', link: 'Scheduler', color: 'orange' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dashboard</Text>
        {/* --- Add Logout Button --- */}
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Welcome to your Livestock Management System.</Text>

      <View style={styles.grid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { borderLeftColor: action.color }]}
            onPress={() => navigation.navigate(action.link)} // Ensure 'link' matches screen names in App.js
          >
            <Text style={[styles.cardTitle, { color: action.color }]}>
              {action.title}
            </Text>
            <Text style={styles.cardDescription}>
              {action.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    width: '48%', // Creates a two-column layout
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    color: '#666',
    fontSize: 14,
  },
});

export default Dashboard;