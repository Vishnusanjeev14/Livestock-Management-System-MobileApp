// livestock-management-mobile/components/Feeding.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { feedingAPI, livestockAPI } from '../services/api';

const Feeding = () => {
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    feedType: '',
    quantity: '',
    date: '',
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
      const [feedingResponse, animalsResponse] = await Promise.all([
        feedingAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setFeedingRecords(feedingResponse.data);
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
    if (!formData.animalId || !formData.feedType || !formData.quantity || !formData.date) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (editingRecord) {
        await feedingAPI.update(editingRecord._id, formData);
        setSuccess('Feeding record updated successfully');
      } else {
        await feedingAPI.create(formData);
        setSuccess('Feeding record added successfully');
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
      feedType: record.feedType,
      quantity: record.quantity.toString(),
      date: record.date.split('T')[0],
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this feeding record?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
              await feedingAPI.delete(id);
              setSuccess('Feeding record deleted successfully');
              fetchData();
            } catch (error) {
              setError('Failed to delete feeding record');
            }
          }
        }
      ]
    );
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({ animalId: '', feedType: '', quantity: '', date: '', notes: '' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

  const renderFeedingItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.animalId?.name || 'N/A'}</Text>
        <Text style={styles.cellSubText}>{item.feedType}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellText}>{item.quantity} kg</Text>
        <Text style={styles.cellSubText}>{new Date(item.date).toLocaleDateString()}</Text>
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
        <Text style={styles.title}>Feeding</Text>
        <Button title="Add New" onPress={openModal} />
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      <FlatList
        data={feedingRecords}
        renderItem={renderFeedingItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No feeding records found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit Record' : 'Add Feeding Record'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Text style={styles.label}>Animal</Text>
            <Picker selectedValue={formData.animalId} onValueChange={(v) => handleChange('animalId', v)}>
              <Picker.Item label="Select an animal..." value="" />
              {animals.map((animal) => (
                <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
              ))}
            </Picker>

            <Text style={styles.label}>Feed Type</Text>
            <TextInput style={styles.input} placeholder="e.g., Hay, Grain, Silage" value={formData.feedType} onChangeText={(v) => handleChange('feedType', v)} />

            <Text style={styles.label}>Quantity (kg)</Text>
            <TextInput style={styles.input} placeholder="e.g., 20" keyboardType="numeric" value={formData.quantity} onChangeText={(v) => handleChange('quantity', v)} />
            
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.date} onChangeText={(v) => handleChange('date', v)} />

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

// Add styles
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

export default Feeding;