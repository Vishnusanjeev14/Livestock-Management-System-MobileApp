// livestock-management-mobile/components/Veterinary.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { veterinaryAPI, livestockAPI } from '../services/api';

const Veterinary = () => {
  const [veterinaryRecords, setVeterinaryRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    appointmentDate: '',
    vetName: '',
    visitType: 'Routine Checkup',
    diagnosis: '',
    treatment: '',
    cost: '',
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
      const [veterinaryResponse, animalsResponse] = await Promise.all([
        veterinaryAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setVeterinaryRecords(veterinaryResponse.data);
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
    if (!formData.animalId || !formData.appointmentDate || !formData.vetName || !formData.diagnosis || !formData.treatment) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (editingRecord) {
        await veterinaryAPI.update(editingRecord._id, formData);
        setSuccess('Record updated successfully');
      } else {
        await veterinaryAPI.create(formData);
        setSuccess('Record added successfully');
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
      appointmentDate: record.appointmentDate.split('T')[0],
      vetName: record.vetName,
      vetContact: record.vetContact || '',
      visitType: record.visitType,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      cost: record.cost ? record.cost.toString() : '',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Record", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await veterinaryAPI.delete(id);
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
    setFormData({ animalId: '', appointmentDate: '', vetName: '', visitType: 'Routine Checkup', diagnosis: '', treatment: '', cost: '' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  const renderVetItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.animalId?.name || 'N/A'}</Text>
        <Text style={styles.cellSubText}>{item.diagnosis}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellText}>{item.vetName}</Text>
        <Text style={styles.cellSubText}>{new Date(item.appointmentDate).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cellActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}><Text style={styles.buttonText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Veterinary</Text>
        <Button title="Add New" onPress={openModal} />
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      <FlatList
        data={veterinaryRecords}
        renderItem={renderVetItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No veterinary records found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit Record' : 'Add Vet Record'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Text style={styles.label}>Animal</Text>
            <Picker selectedValue={formData.animalId} onValueChange={(v) => handleChange('animalId', v)}>
              <Picker.Item label="Select an animal..." value="" />
              {animals.map((animal) => (
                <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
              ))}
            </Picker>
            
            <Text style={styles.label}>Appointment Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.appointmentDate} onChangeText={(v) => handleChange('appointmentDate', v)} />
            <Text style={styles.label}>Veterinarian Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Dr. Smith" value={formData.vetName} onChangeText={(v) => handleChange('vetName', v)} />

            <Text style={styles.label}>Visit Type</Text>
            <Picker selectedValue={formData.visitType} onValueChange={(v) => handleChange('visitType', v)}>
              <Picker.Item label="Routine Checkup" value="Routine Checkup" />
              <Picker.Item label="Emergency" value="Emergency" />
              <Picker.Item label="Vaccination" value="Vaccination" />
              <Picker.Item label="Treatment" value="Treatment" />
            </Picker>

            <Text style={styles.label}>Diagnosis</Text>
            <TextInput style={styles.input} placeholder="e.g., Mastitis" value={formData.diagnosis} onChangeText={(v) => handleChange('diagnosis', v)} />
            <Text style={styles.label}>Treatment</Text>
            <TextInput style={styles.input} placeholder="e.g., Antibiotic course" value={formData.treatment} onChangeText={(v) => handleChange('treatment', v)} />
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={formData.cost} onChangeText={(v) => handleChange('cost', v)} />

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

export default Veterinary;