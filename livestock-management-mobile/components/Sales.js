// livestock-management-mobile/components/Sales.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { salesAPI, livestockAPI } from '../services/api';

const Sales = () => {
  const [activeTab, setActiveTab] = useState('animals');
  const [animalSales, setAnimalSales] = useState([]);
  const [productSales, setProductSales] = useState([]);
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
      const [animalSalesResponse, productSalesResponse, animalsResponse] = await Promise.all([
        salesAPI.getAnimalSales(),
        salesAPI.getProductSales(),
        livestockAPI.getAll()
      ]);
      setAnimalSales(animalSalesResponse.data);
      setProductSales(productSalesResponse.data);
      setAnimals(animalsResponse.data);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    let newFormData = { ...formData, [name]: value };

    // Calculate total price for product sales
    if (activeTab === 'products' && (name === 'quantity' || name === 'unitPrice')) {
      const quantity = parseFloat(name === 'quantity' ? value : formData.quantity || 0);
      const unitPrice = parseFloat(name === 'unitPrice' ? value : formData.unitPrice || 0);
      newFormData.totalPrice = (quantity * unitPrice).toFixed(2);
    }
    setFormData(newFormData);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    try {
      if (activeTab === 'animals') {
        if (editingRecord) {
          await salesAPI.updateAnimalSale(editingRecord._id, formData);
          setSuccess('Animal sale updated');
        } else {
          await salesAPI.createAnimalSale(formData);
          setSuccess('Animal sale added');
        }
      } else {
        if (editingRecord) {
          await salesAPI.updateProductSale(editingRecord._id, formData);
          setSuccess('Product sale updated');
        } else {
          await salesAPI.createProductSale(formData);
          setSuccess('Product sale added');
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
      saleDate: '',
      buyerName: '',
      buyerContact: '',
      salePrice: '',
      saleReason: 'Breeding',
      productType: 'Milk',
      quantity: '',
      unit: 'Liters',
      unitPrice: '',
      totalPrice: '',
      notes: ''
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    if (activeTab === 'animals') {
      setFormData({
        animalId: record.animalId._id,
        saleDate: record.saleDate.split('T')[0],
        buyerName: record.buyerName,
        buyerContact: record.buyerContact || '',
        salePrice: record.salePrice.toString(),
        saleReason: record.saleReason,
        notes: record.notes || ''
      });
    } else {
      setFormData({
        animalId: record.animalId?._id || '',
        saleDate: record.saleDate.split('T')[0],
        buyerName: record.buyerName,
        buyerContact: record.buyerContact || '',
        productType: record.productType,
        quantity: record.quantity.toString(),
        unit: record.unit,
        unitPrice: record.unitPrice.toString(),
        totalPrice: record.totalPrice.toString(),
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
            if (activeTab === 'animals') {
              await salesAPI.deleteAnimalSale(id);
            } else {
              await salesAPI.deleteProductSale(id);
            }
            setSuccess('Sale record deleted');
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

  const renderAnimalSaleItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.animalId?.name || 'N/A'}</Text>
        <Text style={styles.cellSubText}>Buyer: {item.buyerName}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={[styles.cellText, { color: '#28a745' }]}>${item.salePrice}</Text>
        <Text style={styles.cellSubText}>{new Date(item.saleDate).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cellActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}><Text style={styles.buttonText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderProductSaleItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.cellName}>
        <Text style={styles.cellNameText}>{item.productType}</Text>
        <Text style={styles.cellSubText}>{item.quantity} {item.unit}</Text>
      </View>
      <View style={styles.cellStatus}>
        <Text style={[styles.cellText, { color: '#28a745' }]}>${item.totalPrice}</Text>
        <Text style={styles.cellSubText}>Buyer: {item.buyerName}</Text>
      </View>
      <View style={styles.cellActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}><Text style={styles.buttonText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );
  
  const renderAnimalSaleForm = () => (
    <>
      <Text style={styles.label}>Animal</Text>
      <Picker selectedValue={formData.animalId} onValueChange={(v) => handleChange('animalId', v)}>
        <Picker.Item label="Select an animal..." value="" />
        {animals.map((animal) => (
          <Picker.Item key={animal._id} label={`${animal.name} (${animal.species})`} value={animal._id} />
        ))}
      </Picker>
      <Text style={styles.label}>Sale Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.saleDate} onChangeText={(v) => handleChange('saleDate', v)} />
      <Text style={styles.label}>Buyer Name</Text>
      <TextInput style={styles.input} placeholder="Buyer Name" value={formData.buyerName} onChangeText={(v) => handleChange('buyerName', v)} />
      <Text style={styles.label}>Sale Price ($)</Text>
      <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={formData.salePrice} onChangeText={(v) => handleChange('salePrice', v)} />
      <Text style={styles.label}>Sale Reason</Text>
      <Picker selectedValue={formData.saleReason} onValueChange={(v) => handleChange('saleReason', v)}>
        <Picker.Item label="Breeding" value="Breeding" />
        <Picker.Item label="Meat" value="Meat" />
        <Picker.Item label="Dairy" value="Dairy" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
    </>
  );
  
  const renderProductSaleForm = () => (
    <>
      <Text style={styles.label}>Product Type</Text>
      <Picker selectedValue={formData.productType} onValueChange={(v) => handleChange('productType', v)}>
        <Picker.Item label="Milk" value="Milk" />
        <Picker.Item label="Eggs" value="Eggs" />
        <Picker.Item label="Meat" value="Meat" />
        <Picker.Item label="Wool" value="Wool" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      <Text style={styles.label}>Quantity</Text>
      <TextInput style={styles.input} placeholder="e.g., 50" keyboardType="numeric" value={formData.quantity} onChangeText={(v) => handleChange('quantity', v)} />
      <Text style={styles.label}>Unit</Text>
      <Picker selectedValue={formData.unit} onValueChange={(v) => handleChange('unit', v)}>
        <Picker.Item label="Liters" value="Liters" />
        <Picker.Item label="Pieces" value="Pieces" />
        <Picker.Item label="Kilograms" value="Kilograms" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      <Text style={styles.label}>Unit Price ($)</Text>
      <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={formData.unitPrice} onChangeText={(v) => handleChange('unitPrice', v)} />
      <Text style={styles.label}>Total Price ($)</Text>
      <TextInput style={styles.input} value={formData.totalPrice} editable={false} />
      <Text style={styles.label}>Sale Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.saleDate} onChangeText={(v) => handleChange('saleDate', v)} />
      <Text style={styles.label}>Buyer Name</Text>
      <TextInput style={styles.input} placeholder="Buyer Name" value={formData.buyerName} onChangeText={(v) => handleChange('buyerName', v)} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Sales</Text>
        <Button title="Add New" onPress={openModal} />
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'animals' && styles.activeTab]} onPress={() => setActiveTab('animals')}>
          <Text style={[styles.tabText, activeTab === 'animals' && styles.activeTabText]}>Animal Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'products' && styles.activeTab]} onPress={() => setActiveTab('products')}>
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Product Sales</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {success ? <Text style={styles.successMessage}>{success}</Text> : null}
      
      <FlatList
        data={activeTab === 'animals' ? animalSales : productSales}
        renderItem={activeTab === 'animals' ? renderAnimalSaleItem : renderProductSaleItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.emptyText}>No {activeTab} sales found.</Text>}
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit' : 'Add'} {activeTab === 'animals' ? 'Animal Sale' : 'Product Sale'}</Text>
            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
            {activeTab === 'animals' ? renderAnimalSaleForm() : renderProductSaleForm()}
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

export default Sales;