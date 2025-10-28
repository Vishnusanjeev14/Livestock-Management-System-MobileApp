// livestock-management-mobile/components/Breeding.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { breedingAPI, livestockAPI } from '../services/api';

const Breeding = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    partnerAnimalId: '',
    breedingDate: '',
    outcome: 'Pending',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [breedingResponse, animalsResponse] = await Promise.all([
        breedingAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setBreedingRecords(breedingResponse.data);
      setAnimals(animalsResponse.data);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.animalId || !formData.partnerAnimalId || !formData.breedingDate) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (editingRecord) {
        await breedingAPI.update(editingRecord._id, formData);
        setSuccess('Breeding record updated successfully');
      } else {
        await breedingAPI.create(formData);
        setSuccess('Breeding record added successfully');
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
      animalId: record.animalId._id,
      partnerAnimalId: record.partnerAnimalId._id,
      breedingDate: record.breedingDate.split('T')[0],
      outcome: record.outcome,
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
     Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this breeding record?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
              await breedingAPI.delete(id);
              setSuccess('Breeding record deleted successfully');
              fetchData();
            } catch (error) {
              setError('Failed to delete breeding record');
            }
          }
        }
      ]
    );
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({ animalId: '', partnerAnimalId: '', breedingDate: '', outcome: 'Pending', notes: '' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

  const renderBreedingItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.animalId?.name || 'N/A'}</Text>
        <Text style={styles.cellSubText}>Partner: {item.partnerAnimalId?.name || 'N/A'}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellText}>{item.outcome}</Text>
        <Text style={styles.cellSubText}>{new Date(item.breedingDate).toLocaleDateString()}</Text>
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
        <Text style={styles.title}>Breeding</Text>
        <Button title="Add New" onPress={openModal} />
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      <FlatList
        data={breedingRecords}
        renderItem={renderBreedingItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No breeding records found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit Record' : 'Add Breeding Record'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Text style={styles.label}>Animal</Text>
            <Picker selectedValue={formData.animalId} onValueChange={(v) => handleChange('animalId', v)}>
              <Picker.Item label="Select an animal..." value="" />
              {animals.map((animal) => (
                <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
              ))}
            </Picker>

            <Text style={styles.label}>Partner Animal</Text>
            <Picker selectedValue={formData.partnerAnimalId} onValueChange={(v) => handleChange('partnerAnimalId', v)}>
              <Picker.Item label="Select a partner..." value="" />
              {animals.filter(a => a._id !== formData.animalId).map((animal) => (
                <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
              ))}
            </Picker>

            <Text style={styles.label}>Breeding Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.breedingDate} onChangeText={(v) => handleChange('breedingDate', v)} />

            <Text style={styles.label}>Outcome</Text>
            <Picker selectedValue={formData.outcome} onValueChange={(v) => handleChange('outcome', v)}>
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Successful" value="Successful" />
              <Picker.Item label="Unsuccessful" value="Unsuccessful" />
              <Picker.Item label="Unknown" value="Unknown" />
            </Picker>

            <Text style={styles.label}>Notes</Text>
            <TextInput style={styles.input} placeholder="Notes..." value={formData.notes} onChangeText={(v) => handleChange('notes', v)} />

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
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  errorMessage: { color: 'red', textAlign: 'center', margin: 10 },
  successMessage: { color: 'green', textAlign: 'center', margin: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' }
});

export default Breeding;