// livestock-management-mobile/components/Staff.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { staffAPI, livestockAPI } from '../services/api';

const Staff = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [employeesResponse, tasksResponse, animalsResponse] = await Promise.all([
        staffAPI.getEmployees(),
        staffAPI.getTasks(),
        livestockAPI.getAll()
      ]);
      setEmployees(employeesResponse.data);
      setTasks(tasksResponse.data);
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
    setError('');
    setSuccess('');
    try {
      if (activeTab === 'employees') {
        if (editingRecord) {
          await staffAPI.updateEmployee(editingRecord._id, formData);
          setSuccess('Employee updated');
        } else {
          await staffAPI.createEmployee(formData);
          setSuccess('Employee added');
        }
      } else {
        if (editingRecord) {
          await staffAPI.updateTask(editingRecord._id, formData);
          setSuccess('Task updated');
        } else {
          await staffAPI.createTask(formData);
          setSuccess('Task added');
        }
      }
      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save record');
    }
  };

  const resetForm = () => {
    setFormData(activeTab === 'employees' ? {
      name: '', position: '', email: '', phone: '', hireDate: ''
    } : {
      title: '', assignedTo: '', animalId: '', taskType: 'Feeding', priority: 'Medium', dueDate: ''
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    if (activeTab === 'employees') {
      setFormData({
        name: record.name,
        position: record.position,
        email: record.email,
        phone: record.phone,
        hireDate: record.hireDate.split('T')[0],
      });
    } else {
      setFormData({
        title: record.title,
        assignedTo: record.assignedTo?._id || '',
        animalId: record.animalId?._id || '',
        taskType: record.taskType,
        priority: record.priority,
        dueDate: record.dueDate.split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Record", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            if (activeTab === 'employees') {
              await staffAPI.deleteEmployee(id);
            } else {
              await staffAPI.deleteTask(id);
            }
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
    resetForm();
    setError('');
    setSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  const renderEmployeeItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.name}</Text>
        <Text style={styles.cellSubText}>{item.position}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellSubText}>{item.email}</Text>
        <Text style={styles.cellSubText}>{item.phone}</Text>
      </View>
      <View style={styles.cellActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}><Text style={styles.buttonText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderTaskItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.title}</Text>
        <Text style={styles.cellSubText}>To: {item.assignedTo?.name || 'N/A'}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={styles.cellText}>{item.priority}</Text>
        <Text style={styles.cellSubText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cellActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}><Text style={styles.buttonText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderEmployeeForm = () => (
    <>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={formData.name} onChangeText={(v) => handleChange('name', v)} />
      <Text style={styles.label}>Position</Text>
      <TextInput style={styles.input} placeholder="e.g., Farm Hand" value={formData.position} onChangeText={(v) => handleChange('position', v)} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="email@example.com" keyboardType="email-address" value={formData.email} onChangeText={(v) => handleChange('email', v)} />
      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={formData.phone} onChangeText={(v) => handleChange('phone', v)} />
      <Text style={styles.label}>Hire Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.hireDate} onChangeText={(v) => handleChange('hireDate', v)} />
    </>
  );
  
  const renderTaskForm = () => (
    <>
      <Text style={styles.label}>Task Title</Text>
      <TextInput style={styles.input} placeholder="e.g., Repair fence" value={formData.title} onChangeText={(v) => handleChange('title', v)} />
      <Text style={styles.label}>Assign To</Text>
      <Picker selectedValue={formData.assignedTo} onValueChange={(v) => handleChange('assignedTo', v)}>
        <Picker.Item label="Select an employee..." value="" />
        {employees.map((emp) => (
          <Picker.Item key={emp._id} label={emp.name} value={emp._id} />
        ))}
      </Picker>
      <Text style={styles.label}>Animal (Optional)</Text>
      <Picker selectedValue={formData.animalId} onValueChange={(v) => handleChange('animalId', v)}>
        <Picker.Item label="Select an animal..." value="" />
        {animals.map((animal) => (
          <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
        ))}
      </Picker>
      <Text style={styles.label}>Task Type</Text>
      <Picker selectedValue={formData.taskType} onValueChange={(v) => handleChange('taskType', v)}>
        <Picker.Item label="Feeding" value="Feeding" />
        <Picker.Item label="Cleaning" value="Cleaning" />
        <Picker.Item label="Health Check" value="Health Check" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      <Text style={styles.label}>Priority</Text>
      <Picker selectedValue={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>
      <Text style={styles.label}>Due Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.dueDate} onChangeText={(v) => handleChange('dueDate', v)} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Staff</Text>
        <Button title="Add New" onPress={openModal} />
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'employees' && styles.activeTab]} onPress={() => setActiveTab('employees')}>
          <Text style={[styles.tabText, activeTab === 'employees' && styles.activeTabText]}>Employees</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'tasks' && styles.activeTab]} onPress={() => setActiveTab('tasks')}>
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>Tasks</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      <FlatList
        data={activeTab === 'employees' ? employees : tasks}
        renderItem={activeTab === 'employees' ? renderEmployeeItem : renderTaskItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No {activeTab} records found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit' : 'Add'} {activeTab === 'employees' ? 'Employee' : 'Task'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
            {activeTab === 'employees' ? renderEmployeeForm() : renderTaskForm()}
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
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#e9ecef', paddingVertical: 10 },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  activeTab: { backgroundColor: '#007bff' },
  tabText: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  activeTabText: { color: 'white' },
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
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});

export default Staff;