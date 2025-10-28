// livestock-management-mobile/components/Scheduler.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { schedulerAPI, livestockAPI } from '../services/api';

const Scheduler = () => {
  const [reminders, setReminders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    animalId: '',
    reminderType: 'Vaccination',
    dueDate: '',
    priority: 'Medium',
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
      const [remindersResponse, summaryResponse, animalsResponse] = await Promise.all([
        schedulerAPI.getAll(),
        schedulerAPI.getSummary(),
        livestockAPI.getAll()
      ]);
      setReminders(remindersResponse.data);
      setSummary(summaryResponse.data);
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
    if (!formData.title || !formData.reminderType || !formData.dueDate) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (editingRecord) {
        await schedulerAPI.update(editingRecord._id, formData);
        setSuccess('Reminder updated');
      } else {
        await schedulerAPI.create(formData);
        setSuccess('Reminder added');
      }
      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save reminder');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      animalId: record.animalId?._id || '',
      reminderType: record.reminderType,
      dueDate: record.dueDate.split('T')[0],
      priority: record.priority,
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Reminder", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await schedulerAPI.delete(id);
            setSuccess('Reminder deleted');
            fetchData();
          } catch (error) {
            setError('Failed to delete reminder');
          }
        }
      }
    ]);
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({ title: '', animalId: '', reminderType: 'Vaccination', dueDate: '', priority: 'Medium' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);
  
  const handleMarkComplete = async (id) => {
    try {
      await schedulerAPI.markComplete(id);
      setSuccess('Reminder marked as completed');
      fetchData();
    } catch (error) {
      setError('Failed to mark reminder as completed');
    }
  };

  const renderReminderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.title}</Text>
        <Text style={styles.cellSubText}>{item.animalId?.name || item.reminderType}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellText}>{item.priority}</Text>
        <Text style={styles.cellSubText}>{new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cellActions}>
        {item.status === 'Pending' &&
          <TouchableOpacity style={styles.completeButton} onPress={() => handleMarkComplete(item._id)}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        }
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
          <Text style={styles.buttonText}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Pending</Text>
        <Text style={styles.summaryAmount}>{summary?.pendingReminders || 0}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Overdue</Text>
        <Text style={[styles.summaryAmount, { color: '#dc3545' }]}>{summary?.overdueReminders || 0}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Scheduler</Text>
        <Button title="Add New" onPress={openModal} />
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={styles.emptyText}>No reminders found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit Reminder' : 'Add Reminder'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="e.g., Vaccinate cows" value={formData.title} onChangeText={(v) => handleChange('title', v)} />
            
            <Text style={styles.label}>Reminder Type</Text>
            <Picker selectedValue={formData.reminderType} onValueChange={(v) => handleChange('reminderType', v)}>
              <Picker.Item label="Vaccination" value="Vaccination" />
              <Picker.Item label="Breeding Check" value="Breeding Check" />
              <Picker.Item label="Feeding" value="Feeding" />
              <Picker.Item label="Health Check" value="Health Check" />
              <Picker.Item label="Other" value="Other" />
            </Picker>

            <Text style={styles.label}>Animal (Optional)</Text>
            <Picker selectedValue={formData.animalId} onValueChange={(v) => handleChange('animalId', v)}>
              <Picker.Item label="Select an animal..." value="" />
              {animals.map((animal) => (
                <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
              ))}
            </Picker>
            
            <Text style={styles.label}>Due Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.dueDate} onChangeText={(v) => handleChange('dueDate', v)} />

            <Text style={styles.label}>Priority</Text>
            <Picker selectedValue={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  title: { fontSize: 28, fontWeight: 'bold' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
  summaryCard: { flex: 1, padding: 15, backgroundColor: 'white', margin: 5, borderRadius: 8, alignItems: 'center', elevation: 2 },
  summaryTitle: { fontSize: 16, color: '#666' },
  summaryAmount: { fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  row: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white', alignItems: 'center' },
  cellName: { flex: 3 },
  cellStatus: { flex: 2, alignItems: 'flex-end' },
  cellActions: { flex: 2, flexDirection: 'row', justifyContent: 'flex-end' },
  cellText: { fontSize: 16, fontWeight: '500' },
  cellNameText: { fontSize: 16, fontWeight: 'bold' },
  cellSubText: { fontSize: 14, color: '#666' },
  completeButton: { backgroundColor: '#28a745', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4, marginRight: 5 },
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

export default Scheduler;