import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    console.log('Attempting to log in with:', formData.email); // DEBUG LOG

    try {
      const result = await login(formData.email, formData.password);
    
      if (!result.success) {
        setError(result.message || 'Login failed from component');
        // The context already shows an alert, but we can set local error state
      }
      // If successful, the navigator in App.js will handle the screen change.

    } catch (e) {
      console.error("Critical Error in handleSubmit:", e);
      Alert.alert("Critical Error", "An unexpected error occurred. Check the console for details.");
      setError("A critical error occurred.");
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authForm}>
        <Text style={styles.title}>Sign In</Text>
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Enter your email"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={true} 
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder="Enter your password"
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <Button
            title="Sign In"
            onPress={handleSubmit}
          />
        )}
        
        <View style={styles.authLink}>
          <Text style={styles.linkPrompt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  authForm: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  input: {
    width: '100%',
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 16,
  },
  authLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkPrompt: {
    fontSize: 16,
  },
  linkText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignIn;