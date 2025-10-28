// livestock-management-mobile/components/Finance.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { financeAPI, livestockAPI } from '../services/api';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [expensesResponse, incomeResponse, animalsResponse, summaryResponse] = await Promise.all([
        financeAPI.getExpenses(),
        financeAPI.getIncome(),
        livestockAPI.getAll(),
        financeAPI.getSummary()
      ]);
      setExpenses(expensesResponse.data);
      setIncome(incomeResponse.data);
      setAnimals(animalsResponse.data);
      setSummary(summaryResponse.data);
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
      const submitData = { ...formData, amount: parseFloat(formData.amount) };

      if (activeTab === 'expenses') {
        if (editingRecord) {
          await financeAPI.updateExpense(editingRecord._id, submitData);
          setSuccess('Expense updated');
        } else {
          await financeAPI.createExpense(submitData);
          setSuccess('Expense added');
        }
      } else {
        if (editingRecord) {
          await financeAPI.updateIncome(editingRecord._id, submitData);
          setSuccess('Income updated');
        } else {
          await financeAPI.createIncome(submitData);
          setSuccess('Income added');
        }
      }
      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save record');
    }
  };

  const resetForm = () => {
    setFormData({
      animalId: '',
      expenseDate: '',
      incomeDate: '',
      category: activeTab === 'expenses' ? 'Feed' : 'Animal Sale',
      description: '',
      amount: '',
      supplier: '',
      buyer: '',
      paymentMethod: 'Cash',
      notes: ''
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    if (activeTab === 'expenses') {
      setFormData({
        animalId: record.animalId?._id || '',
        expenseDate: record.expenseDate.split('T')[0],
        category: record.category,
        description: record.description,
        amount: record.amount.toString(),
        supplier: record.supplier || '',
        paymentMethod: record.paymentMethod,
        notes: record.notes || ''
      });
    } else {
      setFormData({
        animalId: record.animalId?._id || '',
        incomeDate: record.incomeDate.split('T')[0],
        category: record.category,
        description: record.description,
        amount: record.amount.toString(),
        buyer: record.buyer || '',
        paymentMethod: record.paymentMethod,
        notes: record.notes || ''
      });
    }
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Record", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            if (activeTab === 'expenses') {
              await financeAPI.deleteExpense(id);
            } else {
              await financeAPI.deleteIncome(id);
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

  const renderFinanceItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.category}</Text>
        <Text style={styles.cellSubText}>{item.description}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={[styles.cellText, { color: activeTab === 'expenses' ? '#dc3545' : '#28a745' }]}>
          ${item.amount.toFixed(2)}
        </Text>
        <Text style={styles.cellSubText}>{new Date(item.expenseDate || item.incomeDate).toLocaleDateString()}</Text>
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

  const renderTabContent = () => {
    if (activeTab === 'reports') {
      return (
        <ScrollView>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Income</Text>
            <Text style={[styles.summaryAmount, { color: '#28a745' }]}>${summary?.totalIncome.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#dc3545' }]}>${summary?.totalExpenses.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: summary?.netProfit >= 0 ? '#d4edda' : '#f8d7da' }]}>
            <Text style={styles.summaryTitle}>Net Profit</Text>
            <Text style={[styles.summaryAmount, { color: summary?.netProfit >= 0 ? '#155724' : '#721c24' }]}>
              ${summary?.netProfit.toFixed(2) || '0.00'}
            </Text>
          </View>
        </ScrollView>
      );
    }
    
    return (
      <FlatList
        data={activeTab === 'expenses' ? expenses : income}
        renderItem={renderFinanceItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No {activeTab} records found.</Text>}
      />
    );
  };
  
  const renderModalForm = () => (
    <ScrollView>
      <Text style={styles.label}>Date</Text>
      <TextInput 
        style={styles.input} 
        placeholder="YYYY-MM-DD" 
        value={activeTab === 'expenses' ? formData.expenseDate : formData.incomeDate} 
        onChangeText={(v) => handleChange(activeTab === 'expenses' ? 'expenseDate' : 'incomeDate', v)} 
      />
      <Text style={styles.label}>Category</Text>
      <Picker 
        selectedValue={formData.category} 
        onValueChange={(v) => handleChange('category', v)}
      >
        {activeTab === 'expenses' ? (
          <>
            <Picker.Item label="Feed" value="Feed" />
            <Picker.Item label="Medicine" value="Medicine" />
            <Picker.Item label="Equipment" value="Equipment" />
            <Picker.Item label="Labor" value="Labor" />
            <Picker.Item label="Utilities" value="Utilities" />
            <Picker.Item label="Transport" value="Transport" />
            <Picker.Item label="Other" value="Other" />
          </>
        ) : (
          <>
            <Picker.Item label="Animal Sale" value="Animal Sale" />
            <Picker.Item label="Product Sale" value="Product Sale" />
            <Picker.Item label="Milk" value="Milk" />
            <Picker.Item label="Eggs" value="Eggs" />
            <Picker.Item label="Meat" value="Meat" />
            <Picker.Item label="Wool" value="Wool" />
            <Picker.Item label="Other" value="Other" />
          </>
        )}
      </Picker>
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} placeholder="Description" value={formData.description} onChangeText={(v) => handleChange('description', v)} />
      <Text style={styles.label}>Amount ($)</Text>
      <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={formData.amount} onChangeText={(v) => handleChange('amount', v)} />
      <Text style={styles.label}>Payment Method</Text>
      <Picker selectedValue={formData.paymentMethod} onValueChange={(v) => handleChange('paymentMethod', v)}>
        <Picker.Item label="Cash" value="Cash" />
        <Picker.Item label="Bank Transfer" value="Bank Transfer" />
        <Picker.Item label="Check" value="Check" />
      </Picker>
      <Text style={styles.label}>Notes</Text>
      <TextInput style={styles.input} placeholder="Notes..." value={formData.notes} onChangeText={(v) => handleChange('notes', v)} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Finance</Text>
        {activeTab !== 'reports' && <Button title="Add New" onPress={openModal} />}
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'expenses' && styles.activeTab]} onPress={() => setActiveTab('expenses')}>
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'income' && styles.activeTab]} onPress={() => setActiveTab('income')}>
          <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'reports' && styles.activeTab]} onPress={() => setActiveTab('reports')}>
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Reports</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      {renderTabContent()}

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingRecord ? 'Edit' : 'Add'} {activeTab === 'expenses' ? 'Expense' : 'Income'}</Text>
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
          {renderModalForm()}
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={closeModal} color="#6c757d" />
            <Button title={editingRecord ? 'Update' : 'Add Record'} onPress={handleSubmit} />
          </View>
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
  summaryCard: { backgroundColor: 'white', padding: 20, borderRadius: 8, margin: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  summaryAmount: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
});

export default Finance;