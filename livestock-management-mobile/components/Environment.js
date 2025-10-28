// livestock-management-mobile/components/Environment.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { environmentAPI } from '../services/api';

const Environment = () => {
  const [environmentalData, setEnvironmentalData] = useState([]);
  const [cities, setCities] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    location: { city: '' },
    date: '',
    temperature: '',
    humidity: '',
    weatherCondition: 'Sunny',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dataResponse, citiesResponse] = await Promise.all([
        environmentAPI.getAll(),
        environmentAPI.getCities()
      ]);
      setEnvironmentalData(dataResponse.data);
      setCities(citiesResponse.data);
      if (citiesResponse.data.length > 0) {
        setSelectedCity(citiesResponse.data[0]);
      }
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    if (name === 'city') {
      setFormData({ ...formData, location: { city: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!formData.location.city || !formData.date || !formData.temperature || !formData.humidity) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      if (editingRecord) {
        await environmentAPI.update(editingRecord._id, formData);
        setSuccess('Record updated');
      } else {
        await environmentAPI.create(formData);
        setSuccess('Record added');
      }
      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      location: { city: record.location.city },
      date: record.date.split('T')[0],
      temperature: record.temperature.toString(),
      humidity: record.humidity.toString(),
      weatherCondition: record.weatherCondition,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Record", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await environmentAPI.delete(id);
            setSuccess('Record deleted');
            fetchData();
          } catch (error) {
            setError('Failed to delete record');
          }
        }
      }
    ]);
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({ location: { city: '' }, date: '', temperature: '', humidity: '', weatherCondition: 'Sunny' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  const handleGetForecast = async () => {
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }
    try {
      const response = await environmentAPI.getForecast(selectedCity);
      setForecast(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch forecast');
    }
  };

  const renderEnvItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.location.city}</Text>
        <Text style={styles.cellSubText}>{item.weatherCondition}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellText}>{item.temperature}°C</Text>
        <Text style={styles.cellSubText}>{item.humidity}% Humidity</Text>
      </View>
      <View style={styles.cellActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Environment</Text>
        <Button title="Add Data" onPress={openModal} />
      </View>
      
      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}

      <View style={styles.forecastContainer}>
        <Picker selectedValue={selectedCity} onValueChange={(itemValue) => setSelectedCity(itemValue)}>
          {cities.map((city, index) => (
            <Picker.Item key={index} label={city} value={city} />
          ))}
        </Picker>
        <Button title="Get Forecast" onPress={handleGetForecast} />
        {forecast && (
          <View style={styles.forecastBox}>
            <Text style={styles.forecastTitle}>Current Weather in {forecast.city}:</Text>
            <Text>{forecast.current.temperature}°C, {forecast.current.condition}</Text>
            <Text>{forecast.current.humidity}% Humidity</Text>
          </View>
        )}
      </View>
      
      <FlatList
        data={environmentalData}
        renderItem={renderEnvItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No environmental data found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit Record' : 'Add Env. Data'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} placeholder="City Name" value={formData.location.city} onChangeText={(v) => handleChange('city', v)} />
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.date} onChangeText={(v) => handleChange('date', v)} />
            <Text style={styles.label}>Temperature (°C)</Text>
            <TextInput style={styles.input} placeholder="e.g., 25" keyboardType="numeric" value={formData.temperature} onChangeText={(v) => handleChange('temperature', v)} />
            <Text style={styles.label}>Humidity (%)</Text>
            <TextInput style={styles.input} placeholder="e.g., 60" keyboardType="numeric" value={formData.humidity} onChangeText={(v) => handleChange('humidity', v)} />

            <Text style={styles.label}>Weather Condition</Text>
            <Picker selectedValue={formData.weatherCondition} onValueChange={(v) => handleChange('weatherCondition', v)}>
              <Picker.Item label="Sunny" value="Sunny" />
              <Picker.Item label="Cloudy" value="Cloudy" />
              <Picker.Item label="Rainy" value="Rainy" />
              <Picker.Item label="Stormy" value="Stormy" />
            </Picker>

            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={closeModal} color="#6c757d" />
              <Button title={editingRecord ? 'Update' : 'Add Record'} onPress={handleSubmit} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Add styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  title: { fontSize: 28, fontWeight: 'bold' },
  forecastContainer: { padding: 15, backgroundColor: 'white', margin: 15, borderRadius: 8 },
  forecastBox: { marginTop: 10, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 5 },
  forecastTitle: { fontWeight: 'bold', marginBottom: 5 },
  row: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white', alignItems: 'center' },
  cellName: { flex: 3 },
  cellStatus: { flex: 2, alignItems: 'flex-end' },
  cellActions: { flex: 2, flexDirection: 'row', justifyContent: 'flex-end' },
  cellText: { fontSize: 16, fontWeight: '500' },
  cellNameText: { fontSize: 16, fontWeight: 'bold' },
  cellSubText: { fontSize: 14, color: '#666' },
  editButton: { backgroundColor: '#6c757d', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4, marginRight: 5 },
  deleteButton: { backgroundColor: '#dc3545', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4 },
  buttonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 44, borderColor: '#ddd', borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, marginBottom: 15, fontSize: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: '#555' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  errorMessage: { color: 'red', textAlign: 'center', margin: 10 },
  successMessage: { color: 'green', textAlign: 'center', margin: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' }
});

export default Environment;