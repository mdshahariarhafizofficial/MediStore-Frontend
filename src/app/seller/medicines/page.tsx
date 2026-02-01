'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Search, Filter, Edit, Trash2, 
  Package, AlertCircle, Eye, MoreVertical,
  TrendingUp, Star, DollarSign, Save,
  Calendar, Shield
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth.store';
import { sellerApi } from '@/lib/api/seller';
import { medicineApi } from '@/lib/api/medicine';

export default function SellerMedicinesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<any>(null);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    manufacturer: '',
    expiryDate: '',
    categoryId: '',
    imageUrl: ''
  });

  // Redirect if not authenticated as seller
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SELLER') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch seller medicines
  const { data: medicinesData, isLoading, refetch } = useQuery({
    queryKey: ['seller-medicines'],
    queryFn: () => sellerApi.getMedicines(),
    enabled: isAuthenticated && user?.role === 'SELLER',
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => medicineApi.getCategories(),
  });

  // Add medicine mutation
  const addMutation = useMutation({
    mutationFn: (data: any) => sellerApi.addMedicine(data),
    onSuccess: () => {
      toast.success('Medicine added successfully');
      refetch();
      setIsAddModalOpen(false);
      setNewMedicine({
        name: '',
        description: '',
        price: '',
        stock: '',
        manufacturer: '',
        expiryDate: '',
        categoryId: '',
        imageUrl: ''
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add medicine');
    },
  });

  // Update medicine mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      sellerApi.updateMedicine(id, data),
    onSuccess: () => {
      toast.success('Medicine updated successfully');
      refetch();
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update medicine');
    },
  });

  // Delete medicine mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sellerApi.deleteMedicine(id),
    onSuccess: () => {
      toast.success('Medicine deleted successfully');
      refetch();
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete medicine');
    },
  });

  const medicines = medicinesData?.data || [];
  const categories = categoriesData?.data || [];

  const handleEdit = (medicine: any) => {
    setSelectedMedicine(medicine);
    setNewMedicine({
      name: medicine.name,
      description: medicine.description,
      price: medicine.price.toString(),
      stock: medicine.stock.toString(),
      manufacturer: medicine.manufacturer,
      expiryDate: medicine.expiryDate.split('T')[0],
      categoryId: medicine.categoryId,
      imageUrl: medicine.imageUrl || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (medicine: any) => {
    setMedicineToDelete(medicine);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (medicineToDelete) {
      deleteMutation.mutate(medicineToDelete.id);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const medicineData = {
      name: newMedicine.name,
      description: newMedicine.description,
      price: parseFloat(newMedicine.price),
      stock: parseInt(newMedicine.stock),
      manufacturer: newMedicine.manufacturer,
      expiryDate: newMedicine.expiryDate,
      categoryId: newMedicine.categoryId,
      imageUrl: newMedicine.imageUrl || undefined
    };

    addMutation.mutate(medicineData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine) return;

    const medicineData = {
      name: newMedicine.name,
      description: newMedicine.description,
      price: parseFloat(newMedicine.price),
      stock: parseInt(newMedicine.stock),
      manufacturer: newMedicine.manufacturer,
      expiryDate: newMedicine.expiryDate,
      categoryId: newMedicine.categoryId,
      imageUrl: newMedicine.imageUrl || undefined
    };

    updateMutation.mutate({ id: selectedMedicine.id, data: medicineData });
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from real data
  const stats = [
    { 
      label: 'Total Products', 
      value: medicines.length, 
      icon: Package, 
      color: 'blue' 
    },
    { 
      label: 'Low Stock', 
      value: medicines.filter(m => m.stock < 10).length, 
      icon: AlertCircle, 
      color: 'red' 
    },
    { 
      label: 'Total Revenue', 
      value: `৳${medicines.reduce((sum, m) => sum + (m.price * m._count?.orderItems || 0), 0).toLocaleString()}`,
      icon: DollarSign, 
      color: 'green' 
    },
    { 
      label: 'Avg. Rating', 
      value: medicines.length > 0 ? 
        (medicines.reduce((sum, m) => sum + (m._count?.reviews || 0), 0) / medicines.length).toFixed(1) : '0.0', 
      icon: Star, 
      color: 'yellow' 
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-600';
      case 'red': return 'bg-red-50 text-red-600';
      case 'yellow': return 'bg-yellow-50 text-yellow-600';
      case 'green': return 'bg-green-50 text-green-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock < 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading medicines..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Medicines</h1>
              <p className="text-gray-600 mt-2">Add, edit, and manage your medicine inventory</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Medicine
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicines by name or manufacturer..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                <TrendingUp className="h-4 w-4 mr-2" />
                Sort By
              </button>
            </div>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredMedicines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Stock</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {medicine.imageUrl ? (
                              <img
                                src={medicine.imageUrl}
                                alt={medicine.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/shop/${medicine.id}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {medicine.name}
                            </Link>
                            <p className="text-sm text-gray-500">{medicine.manufacturer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900">{medicine.category?.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">৳{medicine.price}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStockColor(medicine.stock)}`}>
                          {medicine.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          medicine.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {medicine.stock > 0 ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Link href={`/shop/${medicine.id}`}>
                            <button className="p-2 text-gray-400 hover:text-blue-600">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="p-2 text-gray-400 hover:text-green-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(medicine)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Medicines Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm
                  ? 'No medicines match your search. Try a different term.'
                  : "You haven't added any medicines yet. Start by adding your first product!"}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Medicine
              </Button>
            </div>
          )}
        </div>

        {/* Add Medicine Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Medicine"
          size="lg"
        >
          <form onSubmit={handleAddSubmit}>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicine Name *
                    </label>
                    <Input
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      placeholder="e.g., Paracetamol 500mg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer *
                    </label>
                    <Input
                      value={newMedicine.manufacturer}
                      onChange={(e) => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })}
                      placeholder="e.g., ACI Limited"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newMedicine.description}
                    onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe the medicine, its uses, and benefits..."
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (৳) *
                    </label>
                    <Input
                      type="number"
                      value={newMedicine.price}
                      onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock *
                    </label>
                    <Input
                      type="number"
                      value={newMedicine.stock}
                      onChange={(e) => setNewMedicine({ ...newMedicine, stock: e.target.value })}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <Input
                      type="date"
                      value={newMedicine.expiryDate}
                      onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newMedicine.categoryId}
                      onChange={(e) => setNewMedicine({ ...newMedicine, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL (Optional)
                    </label>
                    <Input
                      value={newMedicine.imageUrl}
                      onChange={(e) => setNewMedicine({ ...newMedicine, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={addMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Edit Medicine Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Medicine"
          size="lg"
        >
          <form onSubmit={handleEditSubmit}>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicine Name *
                    </label>
                    <Input
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      placeholder="e.g., Paracetamol 500mg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer *
                    </label>
                    <Input
                      value={newMedicine.manufacturer}
                      onChange={(e) => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })}
                      placeholder="e.g., ACI Limited"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newMedicine.description}
                    onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe the medicine, its uses, and benefits..."
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (৳) *
                    </label>
                    <Input
                      type="number"
                      value={newMedicine.price}
                      onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock *
                    </label>
                    <Input
                      type="number"
                      value={newMedicine.stock}
                      onChange={(e) => setNewMedicine({ ...newMedicine, stock: e.target.value })}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <Input
                      type="date"
                      value={newMedicine.expiryDate}
                      onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newMedicine.categoryId}
                      onChange={(e) => setNewMedicine({ ...newMedicine, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL (Optional)
                    </label>
                    <Input
                      value={newMedicine.imageUrl}
                      onChange={(e) => setNewMedicine({ ...newMedicine, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Medicine"
          size="md"
        >
          {medicineToDelete && (
            <div className="p-6">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete {medicineToDelete.name}?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this medicine? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    loading={deleteMutation.isPending}
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}