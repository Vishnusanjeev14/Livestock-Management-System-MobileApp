// livestock-management-mobile/components/Animals.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { livestockAPI } from '../services/api';

const Animals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  // Define initial state clearly
  const initialFormData = {
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: 'Male', // Explicit default
    healthStatus: 'Healthy' // Explicit default
  };
  const [formData, setFormData] = useState(initialFormData);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await livestockAPI.getAll();
      setAnimals(response.data || []);
    } catch (error) {
      setError('Failed to fetch animals');
      console.error("Fetch Animals Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure this function correctly updates the state for ALL fields, including pickers
  const handleChange = (name, value) => {
    // console.log(`handleChange called: name=${name}, value=${value}`); // Keep for debugging if needed
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.species || !formData.breed || !formData.dateOfBirth) {
      setError('Please fill all required fields (Name, Species, Breed, DOB).');
      return;
    }
    setError('');
    setSuccess('');
    // console.log("handleSubmit: Submitting data:", formData); // Keep for debugging if needed

    try {
      // Ensure formData includes gender and healthStatus before sending
      const dataToSend = { ...formData };

      if (editingAnimal) {
        await livestockAPI.update(editingAnimal._id, dataToSend);
        setSuccess('Animal updated successfully');
      } else {
        await livestockAPI.create(dataToSend);
        setSuccess('Animal added successfully');
      }
      closeModal();
      fetchAnimals(); // Refresh list
    } catch (error) {
      console.error("handleSubmit Error:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Failed to save animal');
    }
  };

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
    setFormData({
      name: animal.name || '',
      species: animal.species || '',
      breed: animal.breed || '',
      dateOfBirth: animal.dateOfBirth ? animal.dateOfBirth.split('T')[0] : '',
      gender: animal.gender || 'Male',
      healthStatus: animal.healthStatus || 'Healthy'
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Animal",
      "Are you sure you want to delete this animal?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
              await livestockAPI.delete(id);
              setSuccess('Animal deleted successfully');
              fetchAnimals();
            } catch (error) {
              setError('Failed to delete animal');
            }
          }
        }
      ]
    );
  };

  // Ensure this explicitly resets the form using the initial state definition
  const openModal = () => {
    setEditingAnimal(null);
    setFormData(initialFormData); // Use the defined initial state
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const renderAnimalItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.name}</Text>
        <Text style={styles.cellSubText}>{item.species} - {item.breed}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellText}>{item.gender}</Text>
        <Text style={styles.cellSubText}>{item.healthStatus}</Text>
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Animals</Text>
        <Button title="Add New" onPress={openModal} />
      </View>

      {/* Messages */}
      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}

      {/* List */}
      {loading && animals.length === 0 ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
       ) : (
        <FlatList
          data={animals}
          renderItem={renderAnimalItem}
          keyExtractor={(item) => item?._id || Math.random().toString()}
          refreshing={loading}
          onRefresh={fetchAnimals}
          ListEmptyComponent={<Text style={styles.emptyText}>No animals found. Add one!</Text>}
        />
       )}

      {/* Modal Form */}
      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingAnimal ? 'Edit Animal' : 'Add New Animal'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="Name" value={formData.name} onChangeText={(v) => handleChange('name', v)} />

            <Text style={styles.label}>Species</Text>
            <TextInput style={styles.input} placeholder="Species" value={formData.species} onChangeText={(v) => handleChange('species', v)} />

            <Text style={styles.label}>Breed</Text>
            <TextInput style={styles.input} placeholder="Breed" value={formData.breed} onChangeText={(v) => handleChange('breed', v)} />

            <Text style={styles.label}>Date of Birth</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.dateOfBirth} onChangeText={(v) => handleChange('dateOfBirth', v)} />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(itemValue) => handleChange('gender', itemValue)}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
              </Picker>
            </View>

            <Text style={styles.label}>Health Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.healthStatus}
                onValueChange={(itemValue) => handleChange('healthStatus', itemValue)}
              >
                <Picker.Item label="Healthy" value="Healthy" />
                <Picker.Item label="Sick" value="Sick" />
                <Picker.Item label="Under Treatment" value="Under Treatment" />
                <Picker.Item label="Recovered" value="Recovered" />
              </Picker>
            </View>

            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={closeModal} color="#6c757d" />
              <Button title={editingAnimal ? 'Update' : 'Add Animal'} onPress={handleSubmit} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  title: { fontSize: 28, fontWeight: 'bold' },
  row: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white', alignItems: 'center' },
  cellName: { flex: 3 },
  cellStatus: { flex: 2 },
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
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 15,
    height: 50,
    justifyContent: 'center',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  errorMessage: { color: 'red', textAlign: 'center', margin: 10 },
  successMessage: { color: 'green', textAlign: 'center', margin: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' }
});

export default Animals;