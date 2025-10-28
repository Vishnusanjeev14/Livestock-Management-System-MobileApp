import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import Auth Screens
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

// Import Main App Screens
import Dashboard from './components/Dashboard';
import Animals from './components/Animals';
import Breeding from './components/Breeding';
import Feeding from './components/Feeding';
import Finance from './components/Finance';
import Environment from './components/Environment';
import Health from './components/Health';
import Inventory from './components/Inventory';
import Production from './components/Production';
import Sales from './components/Sales';
import Scheduler from './components/Scheduler';
import Staff from './components/Staff';
import Veterinary from './components/Veterinary';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null; // Or return a proper loading screen component

  return (
    <NavigationContainer>
      {/* Configure screen options globally or individually */}
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007bff', // Example header color
          },
          headerTintColor: '#fff', // Header text color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          // --- Screens shown when the user is logged in ---
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="Animals" component={Animals} />
            <Stack.Screen name="Breeding" component={Breeding} />
            <Stack.Screen name="Feeding" component={Feeding} />
            <Stack.Screen name="Finance" component={Finance} />
            <Stack.Screen name="Environment" component={Environment} />
            <Stack.Screen name="Health" component={Health} />
            <Stack.Screen name="Inventory" component={Inventory} />
            <Stack.Screen name="Production" component={Production} />
            <Stack.Screen name="Sales" component={Sales} />
            <Stack.Screen name="Scheduler" component={Scheduler} />
            <Stack.Screen name="Staff" component={Staff} />
            <Stack.Screen name="Veterinary" component={Veterinary} />
          </>
        ) : (
          // --- Screens shown when the user is logged out ---
          <>
            <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Create Account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}