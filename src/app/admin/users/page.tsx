'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, User, Mail, Shield, 
  CheckCircle, XCircle, Edit, MoreVertical,
  TrendingUp, Users as UsersIcon, Package,
  Phone, MapPin, Calendar, Lock
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth.store';
import { adminApi } from '@/lib/api/admin';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    enabled: isAuthenticated && user?.role === 'ADMIN',
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateUserStatus(id, { isActive }),
    onSuccess: () => {
      toast.success('User status updated successfully');
      refetch();
      setIsStatusModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });

  const users = usersData?.data || [];

  const handleStatusUpdate = (user: any) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
    });
    setIsEditModalOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedUser) {
      updateStatusMutation.mutate({
        id: selectedUser.id,
        isActive: !selectedUser.isActive,
      });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update user logic here
    toast.success('User updated successfully');
    setIsEditModalOpen(false);
    refetch();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.isActive) ||
      (statusFilter === 'INACTIVE' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats from real data
  const stats = [
    { 
      label: 'Total Users', 
      value: users.length, 
      icon: UsersIcon, 
      color: 'blue' 
    },
    { 
      label: 'Customers', 
      value: users.filter(u => u.role === 'CUSTOMER').length, 
      icon: User, 
      color: 'green' 
    },
    { 
      label: 'Sellers', 
      value: users.filter(u => u.role === 'SELLER').length, 
      icon: Package, 
      color: 'purple' 
    },
    { 
      label: 'Active Users', 
      value: users.filter(u => u.isActive).length, 
      icon: CheckCircle, 
      color: 'green' 
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users in the system</p>
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
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-50 text-green-600' :
                  'bg-purple-50 text-purple-600'
                }`}>
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
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="SELLER">Seller</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Joined</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Stats</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'SELLER' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900">{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {user.isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{user._count?.medicines || 0}</div>
                            <div className="text-xs text-gray-500">Products</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{user._count?.orders || 0}</div>
                            <div className="text-xs text-gray-500">Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{user._count?.reviews || 0}</div>
                            <div className="text-xs text-gray-500">Reviews</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(user)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              user.isActive
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
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
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Users Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No users match your current filters. Try adjusting your search criteria.'
                  : 'No users found in the system.'}
              </p>
              {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? (
                <Button onClick={() => { 
                  setSearchTerm(''); 
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}>
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User"
          size="lg"
        >
          {selectedUser && (
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      <p className="text-sm text-gray-500 capitalize">{selectedUser.role.toLowerCase()}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={editUserData.name}
                        onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={editUserData.email}
                        onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        value={editUserData.phone}
                        onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        type="tel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        defaultValue={selectedUser.role}
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="SELLER">Seller</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={editUserData.address}
                      onChange={(e) => setEditUserData({ ...editUserData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Reset Password</p>
                        <p className="text-xs text-gray-600">Send password reset link to user's email</p>
                      </div>
                      <Button className="ml-auto" size="sm" variant="outline">
                        Send Reset Link
                      </Button>
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
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Modal>

        {/* Status Update Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={selectedUser?.isActive ? "Deactivate User" : "Activate User"}
          size="md"
        >
          {selectedUser && (
            <div className="p-6">
              <div className="text-center">
                {selectedUser.isActive ? (
                  <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                ) : (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedUser.isActive ? "Deactivate" : "Activate"} {selectedUser.name}?
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedUser.isActive
                    ? "This user will no longer be able to access the system. They can be reactivated later."
                    : "This user will regain access to the system with their previous permissions."}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      <p className="text-sm text-gray-500">Role: {selectedUser.role}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsStatusModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={selectedUser.isActive ? "danger" : "primary"}
                    loading={updateStatusMutation.isPending}
                    onClick={confirmStatusUpdate}
                  >
                    {selectedUser.isActive ? "Deactivate" : "Activate"}
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