// livestock-management-mobile/components/Health.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import { Picker } from '@react-native-picker/picker';
import { healthAPI, livestockAPI } from '../services/api';

const Health = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [animals, setAnimals] = useState([]); // State for animals list
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  // Ensure initial formData state is well-defined
  const initialFormData = {
    animalId: '',
    checkupDate: '',
    diagnosis: '',
    treatment: '',
    vetName: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch both health records and the full animals list simultaneously
      const [healthResponse, animalsResponse] = await Promise.all([
        healthAPI.getAll(),
        livestockAPI.getAll() // Make sure this fetches the animals needed for the dropdown
      ]);
      setHealthRecords(healthResponse.data);
      setAnimals(animalsResponse.data || []); // Ensure animals is always an array
    } catch (error) {
      console.error("Health.js: Error fetching data:", error);
      setError('Failed to fetch data. Check server connection and logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.animalId || !formData.checkupDate || !formData.diagnosis || !formData.treatment || !formData.vetName) {
      setError('Please fill all required fields (Animal, Date, Diagnosis, Treatment, Vet Name).');
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (editingRecord) {
        await healthAPI.update(editingRecord._id, formData);
        setSuccess('Health record updated');
      } else {
        await healthAPI.create(formData);
        setSuccess('Health record added');
      }
      closeModal();
      fetchData(); // Refresh list after saving
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    // Ensure we are setting the ID correctly for the Picker
    const animalIdValue = record.animalId?._id || record.animalId || ''; 
    setFormData({
      animalId: animalIdValue,
      checkupDate: record.checkupDate ? record.checkupDate.split('T')[0] : '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      vetName: record.vetName || '',
      notes: record.notes || ''
    });
    setError(''); // Clear errors when opening modal
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this health record?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
              await healthAPI.delete(id);
              setSuccess('Health record deleted');
              fetchData(); // Refresh list
            } catch (error) {
              setError('Failed to delete health record');
            }
          }
        }
      ]
    );
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData(initialFormData); // Reset form data
    setError(''); // Clear errors when opening modal
    setSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  // Function to render each item in the list
  const renderHealthItem = ({ item }) => {
    // Find the animal name from the state (important if animalId is not populated)
    const animalName = item.animalId?.name || animals.find(a => a._id === item.animalId)?.name || 'N/A';
    
    return (
      <View style={styles.row}>
        <View style={styles.cellName}>
          <Text style={styles.cellNameText}>{animalName}</Text>
          <Text style={styles.cellSubText}>{item.diagnosis}</Text>
        </View>
        <View style={styles.cellStatus}>
          <Text style={styles.cellText}>{item.vetName}</Text>
          <Text style={styles.cellSubText}>{item.checkupDate ? new Date(item.checkupDate).toLocaleDateString() : 'No Date'}</Text>
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
  };

  // Main component render
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Health</Text>
        <Button title="Add New" onPress={openModal} disabled={loading} /> 
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      {loading && healthRecords.length === 0 ? ( 
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={healthRecords}
          renderItem={renderHealthItem}
          keyExtractor={(item) => item?._id || Math.random().toString()}
          refreshing={loading}
          onRefresh={fetchData}
          ListEmptyComponent={<Text style={styles.emptyText}>No health records found.</Text>}
        />
      )}

      {/* Modal for Adding/Editing */}
      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit Record' : 'Add Health Record'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            {/* Animal Picker */}
            <Text style={styles.label}>Animal</Text>
            <View style={styles.pickerContainer}> 
              <Picker 
                selectedValue={formData.animalId} 
                onValueChange={(itemValue) => handleChange('animalId', itemValue)}
                enabled={animals.length > 0} // Disable if animals haven't loaded
              >
                <Picker.Item label="Select an animal..." value="" />
                {animals && animals.length > 0 ? (
                  animals.map((animal) => (
                    <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
                  ))
                ) : (
                  <Picker.Item label="Loading animals..." value="" />
                )}
              </Picker>
            </View>

            {/* Other form fields */}
            <Text style={styles.label}>Checkup Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.checkupDate} onChangeText={(v) => handleChange('checkupDate', v)} />
            
            <Text style={styles.label}>Diagnosis</Text>
            <TextInput style={styles.input} placeholder="e.g., Mastitis" value={formData.diagnosis} onChangeText={(v) => handleChange('diagnosis', v)} />

            <Text style={styles.label}>Treatment</Text>
            <TextInput style={styles.input} placeholder="e.g., Antibiotic course" value={formData.treatment} onChangeText={(v) => handleChange('treatment', v)} />

            <Text style={styles.label}>Veterinarian Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Dr. Smith" value={formData.vetName} onChangeText={(v) => handleChange('vetName', v)} />
            
            <Text style={styles.label}>Notes</Text>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Notes..." value={formData.notes} onChangeText={(v) => handleChange('notes', v)} multiline />

            {/* Modal Buttons */}
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

// Styles remain largely the same, added pickerContainer
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  title: { fontSize: 28, fontWeight: 'bold' },
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
  // Style for Picker container to ensure consistent appearance
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 15,
    height: 50, // Adjust height as needed
    justifyContent: 'center',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  errorMessage: { color: 'red', textAlign: 'center', margin: 10 },
  successMessage: { color: 'green', textAlign: 'center', margin: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' }
});

export default Health;