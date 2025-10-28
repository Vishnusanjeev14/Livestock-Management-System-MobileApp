import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Use the 'api' instance
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser({ token });
        }
      } catch (e) {
        console.error("Failed to load user token.", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      const { token, user: userData } = response.data;
      await AsyncStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ ...userData, token });
      return { success: true };
    } catch (error) {
      if (error.response) {
        Alert.alert("Login Failed", `Server error: ${error.response.data.message || 'Invalid credentials'}`);
      } else if (error.request) {
        Alert.alert("Network Error", "Could not connect to the server. Check your IP/Firewall and ensure the server is running.");
      } else {
        Alert.alert("Error", `An unexpected error occurred: ${error.message}`);
      }
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, phoneNumber) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, phoneNumber });
      const { token, user: userData } = response.data;
      await AsyncStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ ...userData, token });
      return { success: true };
    } catch (error) {
       Alert.alert("Registration Failed", error.response?.data?.message || 'An unknown error occurred.');
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = { user, login, register, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};