'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, User, Mail, Shield, 
  CheckCircle, XCircle, Edit, MoreVertical,
  TrendingUp, Users as UsersIcon, Package,
  Phone, MapPin, Calendar, Lock, Download,
  Plus, RefreshCw, Eye, Trash2, UserPlus,
  MessageSquare, AlertCircle, ChevronDown,
  Grid, List, FileText
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth.store';
import { adminApi } from '@/lib/api/admin';
import { User as UserType, Role } from '@/lib/types';
import axiosInstance from '@/lib/api/axios';

// Custom components for better UI
const StatCard = ({ label, value, icon: Icon, color }: { 
  label: string; 
  value: number; 
  icon: any; 
  color: string;
}) => (
  <Card className="p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </Card>
);

const UserRoleBadge = ({ role }: { role: Role }) => {
  const config = {
    ADMIN: { color: 'bg-purple-100 text-purple-800', icon: Shield },
    SELLER: { color: 'bg-blue-100 text-blue-800', icon: Package },
    CUSTOMER: { color: 'bg-green-100 text-green-800', icon: User },
  }[role];

  const Icon = config.icon;
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${config.color}`}>
      <Icon className="h-3 w-3" />
      {role}
    </span>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`}>
    {isActive ? (
      <>
        <CheckCircle className="h-3 w-3" />
        Active
      </>
    ) : (
      <>
        <XCircle className="h-3 w-3" />
        Inactive
      </>
    )}
  </span>
);

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: currentUser } = useAuthStore();
  
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isExporting, setIsExporting] = useState(false);
  
  // Form states
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'SELLER',
  });

  const [createUserData, setCreateUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'SELLER',
    password: '',
    confirmPassword: '',
  });

  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  // Fetch users
  const { 
    data: usersResponse, 
    isLoading, 
    refetch,
    error: fetchError 
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    enabled: isAuthenticated && currentUser?.role === 'ADMIN',
    retry: 2,
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateUserStatus(id, { isActive }),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('User status updated successfully');
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
      setIsStatusModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user status');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateUser(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('User updated successfully');
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        setIsEditModalOpen(false);
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) =>
      adminApi.deleteUser(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        setIsDeleteModalOpen(false);
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminApi.resetPassword(id, newPassword),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Password reset successfully');
        setNewPassword('');
        setIsResetPasswordModalOpen(false);
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to reset password');
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success('User created successfully');
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        setIsCreateModalOpen(false);
        setCreateUserData({
          name: '',
          email: '',
          phone: '',
          address: '',
          role: 'CUSTOMER',
          password: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.message || 'Failed to create user');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create user');
    },
  });

  const users = usersResponse?.data || [];

  // Action handlers
  const handleStatusUpdate = (user: UserType) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role as 'CUSTOMER' | 'SELLER',
    });
    setIsEditModalOpen(true);
  };

  const handleView = (user: UserType) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDelete = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleResetPassword = (user: UserType) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedUser) {
      updateStatusMutation.mutate({
        id: selectedUser.id,
        isActive: !selectedUser.isActive,
      });
    }
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const confirmResetPassword = () => {
    if (selectedUser && newPassword) {
      resetPasswordMutation.mutate({
        id: selectedUser.id,
        newPassword,
      });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        data: editUserData,
      });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createUserData.password !== createUserData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    createUserMutation.mutate({
      name: createUserData.name,
      email: createUserData.email,
      password: createUserData.password,
      role: createUserData.role,
      phone: createUserData.phone || undefined,
      address: createUserData.address || undefined,
    });
  };

  // Export users to CSV
  const handleExportUsers = async () => {
    setIsExporting(true);
    try {
      const csvData = [
        ['Name', 'Email', 'Role', 'Status', 'Phone', 'Address', 'Joined Date', 'Products', 'Orders', 'Reviews'],
        ...filteredUsers.map(user => [
          user.name,
          user.email,
          user.role,
          user.isActive ? 'Active' : 'Inactive',
          user.phone || 'N/A',
          user.address || 'N/A',
          formatDate(user.createdAt),
          user._count?.medicines || 0,
          user._count?.orders || 0,
          user._count?.reviews || 0,
        ])
      ];

      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `medistore-users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
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
      color: 'bg-blue-500' 
    },
    { 
      label: 'Active Users', 
      value: users.filter(u => u.isActive).length, 
      icon: CheckCircle, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Sellers', 
      value: users.filter(u => u.role === 'SELLER').length, 
      icon: Package, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Customers', 
      value: users.filter(u => u.role === 'CUSTOMER').length, 
      icon: User, 
      color: 'bg-orange-500' 
    },
  ];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Role options
  const roleOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'SELLER', label: 'Seller' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Users</h2>
          <p className="text-gray-600 mb-6">
            Please check your internet connection and try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all users in the system</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExportUsers}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isExporting || filteredUsers.length === 0}
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              onClick={handleCreateUser}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name, email, or phone..."
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Role:</label>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={roleOptions}
                  className="min-w-[140px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Status:</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={statusOptions}
                  className="min-w-[140px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">View:</label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 flex items-center gap-2 ${
                      viewMode === 'list' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 flex items-center gap-2 ${
                      viewMode === 'grid' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Display */}
        {viewMode === 'list' ? (
          /* List View */
          <Card className="overflow-hidden">
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
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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
                          <UserRoleBadge role={user.role} />
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{formatDate(user.createdAt)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge isActive={user.isActive} />
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(user)}
                              title="View Details"
                              className="text-gray-500 hover:text-primary-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              title="Edit User"
                              className="text-gray-500 hover:text-blue-600"
                              disabled={user.role === 'ADMIN' && currentUser?.id !== user.id}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetPassword(user)}
                              title="Reset Password"
                              className="text-gray-500 hover:text-yellow-600"
                              disabled={user.role === 'ADMIN' && currentUser?.id !== user.id}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(user)}
                              title={user.isActive ? "Deactivate" : "Activate"}
                              className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                              disabled={user.role === 'ADMIN' && currentUser?.id !== user.id}
                            >
                              {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            {currentUser?.id !== user.id && user.role !== 'ADMIN' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user)}
                                title="Delete User"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
                {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') ? (
                  <Button onClick={() => { 
                    setSearchTerm(''); 
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                  }}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleCreateUser}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create First User
                  </Button>
                )}
              </div>
            )}
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <UserRoleBadge role={user.role} />
                    <StatusBadge isActive={user.isActive} />
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-900">{user._count?.medicines || 0}</div>
                    <div className="text-xs text-gray-500">Products</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-900">{user._count?.orders || 0}</div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-900">{user._count?.reviews || 0}</div>
                    <div className="text-xs text-gray-500">Reviews</div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(user)}
                    className="flex items-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      title="Edit"
                      className="text-gray-500 hover:text-blue-600"
                      disabled={user.role === 'ADMIN' && currentUser?.id !== user.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResetPassword(user)}
                      title="Reset Password"
                      className="text-gray-500 hover:text-yellow-600"
                      disabled={user.role === 'ADMIN' && currentUser?.id !== user.id}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusUpdate(user)}
                      title={user.isActive ? "Deactivate" : "Activate"}
                      className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                      disabled={user.role === 'ADMIN' && currentUser?.id !== user.id}
                    >
                      {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    {currentUser?.id !== user.id && user.role !== 'ADMIN' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create User Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New User"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit}>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      value={createUserData.name}
                      onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      value={createUserData.email}
                      onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                      placeholder="Enter email address"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      value={createUserData.phone}
                      onChange={(e) => setCreateUserData({ ...createUserData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <Select
                      value={createUserData.role}
                      onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value as 'CUSTOMER' | 'SELLER' })}
                      options={[
                        { value: 'CUSTOMER', label: 'Customer' },
                        { value: 'SELLER', label: 'Seller' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <Input
                      value={createUserData.password}
                      onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                      placeholder="Enter password"
                      type="password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <Input
                      value={createUserData.confirmPassword}
                      onChange={(e) => setCreateUserData({ ...createUserData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      type="password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Textarea
                    value={createUserData.address}
                    onChange={(e) => setCreateUserData({ ...createUserData, address: e.target.value })}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={createUserMutation.isPending}
                >
                  Create User
                </Button>
              </div>
            </div>
          </form>
        </Modal>

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

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input
                        value={editUserData.name}
                        onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <Select
                        value={editUserData.role}
                        onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value as 'CUSTOMER' | 'SELLER' })}
                        options={[
                          { value: 'CUSTOMER', label: 'Customer' },
                          { value: 'SELLER', label: 'Seller' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Textarea
                      value={editUserData.address}
                      onChange={(e) => setEditUserData({ ...editUserData, address: e.target.value })}
                      rows={3}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    loading={updateUserMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Modal>

        {/* View User Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="User Details"
          size="lg"
        >
          {selectedUser && (
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <UserRoleBadge role={selectedUser.role} />
                  <StatusBadge isActive={selectedUser.isActive} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{selectedUser.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>Joined: {formatDateTime(selectedUser.createdAt)}</span>
                      </div>
                      {selectedUser.updatedAt && selectedUser.updatedAt !== selectedUser.createdAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Last Updated: {formatDateTime(selectedUser.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">User Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Products Listed</span>
                        <span className="font-bold">{selectedUser._count?.medicines || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Orders</span>
                        <span className="font-bold">{selectedUser._count?.orders || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reviews Given</span>
                        <span className="font-bold">{selectedUser._count?.reviews || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleEdit(selectedUser);
                        }}
                        disabled={selectedUser.role === 'ADMIN' && currentUser?.id !== selectedUser.id}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleResetPassword(selectedUser);
                        }}
                        disabled={selectedUser.role === 'ADMIN' && currentUser?.id !== selectedUser.id}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Reset Password
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleStatusUpdate(selectedUser);
                        }}
                        className={selectedUser.isActive ? "text-red-600" : "text-green-600"}
                        disabled={selectedUser.role === 'ADMIN' && currentUser?.id !== selectedUser.id}
                      >
                        {selectedUser.isActive ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
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
                    disabled={selectedUser.role === 'ADMIN' && currentUser?.id !== selectedUser.id}
                  >
                    {selectedUser.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete User Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete User"
          size="md"
        >
          {selectedUser && (
            <div className="p-6">
              <div className="text-center">
                <Trash2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete {selectedUser.name}?
                </h3>
                <p className="text-gray-600 mb-6">
                  This action cannot be undone. All user data including medicines, orders, and reviews will be permanently deleted.
                </p>
                <div className="bg-red-50 p-4 rounded-lg mb-6">
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
                  <div className="mt-4 space-y-1 text-sm text-gray-600">
                    <p>• Products: {selectedUser._count?.medicines || 0}</p>
                    <p>• Orders: {selectedUser._count?.orders || 0}</p>
                    <p>• Reviews: {selectedUser._count?.reviews || 0}</p>
                  </div>
                </div>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    loading={deleteUserMutation.isPending}
                    onClick={confirmDeleteUser}
                    disabled={selectedUser.role === 'ADMIN'}
                  >
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          isOpen={isResetPasswordModalOpen}
          onClose={() => {
            setIsResetPasswordModalOpen(false);
            setNewPassword('');
          }}
          title="Reset Password"
          size="md"
        >
          {selectedUser && (
            <div className="p-6">
              <div className="text-center mb-6">
                <Lock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reset password for {selectedUser.name}
                </h3>
                <p className="text-gray-600">Enter a new password for this user.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResetPasswordModalOpen(false);
                    setNewPassword('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={resetPasswordMutation.isPending}
                  onClick={confirmResetPassword}
                  disabled={!newPassword || newPassword.length < 6 || (selectedUser.role === 'ADMIN' && currentUser?.id !== selectedUser.id)}
                >
                  Reset Password
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}