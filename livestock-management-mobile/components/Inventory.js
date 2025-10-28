// livestock-management-mobile/components/Inventory.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { inventoryAPI } from '../services/api';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Feed',
    currentStock: '',
    unit: 'Kilograms',
    minimumStock: '',
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
      const response = await inventoryAPI.getAll();
      setInventoryItems(response.data);
    } catch (error) {
      setError('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.itemName || !formData.category || !formData.currentStock || !formData.unit) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (editingItem) {
        await inventoryAPI.update(editingItem._id, formData);
        setSuccess('Item updated successfully');
      } else {
        await inventoryAPI.create(formData);
        setSuccess('Item added successfully');
      }
      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      currentStock: item.currentStock.toString(),
      unit: item.unit,
      minimumStock: item.minimumStock.toString() || '',
      // Add other fields if needed
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this inventory item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await inventoryAPI.delete(id);
            setSuccess('Item deleted successfully');
            fetchData();
          } catch (error) {
            setError('Failed to delete item');
          }
        }
      }
    ]);
  };

  const openModal = () => {
    setEditingItem(null);
    setFormData({ itemName: '', category: 'Feed', currentStock: '', unit: 'Kilograms', minimumStock: '' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  const getStockStatusColor = (currentStock, minimumStock) => {
    if (currentStock <= minimumStock) return '#dc3545';
    if (currentStock <= minimumStock * 1.5) return '#ffc107';
    return '#28a745';
  };

  const renderInventoryItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.itemName}</Text>
        <Text style={styles.cellSubText}>{item.category}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={[styles.cellText, { color: getStockStatusColor(item.currentStock, item.minimumStock) }]}>
          {item.currentStock} {item.unit}
        </Text>
        <Text style={styles.cellSubText}>Min: {item.minimumStock}</Text>
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
        <Text style={styles.title}>Inventory</Text>
        <Button title="Add New" onPress={openModal} />
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      <FlatList
        data={inventoryItems}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No inventory items found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Add New Item'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Text style={styles.label}>Item Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Cattle Feed" value={formData.itemName} onChangeText={(v) => handleChange('itemName', v)} />
            
            <Text style={styles.label}>Category</Text>
            <Picker selectedValue={formData.category} onValueChange={(v) => handleChange('category', v)}>
              <Picker.Item label="Feed" value="Feed" />
              <Picker.Item label="Medicine" value="Medicine" />
              <Picker.Item label="Equipment" value="Equipment" />
              <Picker.Item label="Supplies" value="Supplies" />
              <Picker.Item label="Other" value="Other" />
            </Picker>

            <Text style={styles.label}>Current Stock</Text>
            <TextInput style={styles.input} placeholder="e.g., 100" keyboardType="numeric" value={formData.currentStock} onChangeText={(v) => handleChange('currentStock', v)} />

            <Text style={styles.label}>Unit</Text>
            <Picker selectedValue={formData.unit} onValueChange={(v) => handleChange('unit', v)}>
              <Picker.Item label="Kilograms" value="Kilograms" />
              <Picker.Item label="Liters" value="Liters" />
              <Picker.Item label="Pieces" value="Pieces" />
              <Picker.Item label="Bags" value="Bags" />
              <Picker.Item label="Bottles" value="Bottles" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
            
            <Text style={styles.label}>Minimum Stock Level</Text>
            <TextInput style={styles.input} placeholder="e.g., 20" keyboardType="numeric" value={formData.minimumStock} onChangeText={(v) => handleChange('minimumStock', v)} />

            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={closeModal} color="#6c757d" />
              <Button title={editingItem ? 'Update' : 'Add Item'} onPress={handleSubmit} />
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

export default Inventory;