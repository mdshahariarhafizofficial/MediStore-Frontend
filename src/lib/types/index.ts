export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type OrderStatus = 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  _count?: {
    medicines?: number;
    orders?: number;
    reviews?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: {
    medicines: number;
  };
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  manufacturer: string;
  expiryDate: string;
  categoryId: string;
  sellerId: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
}

export interface CartItem {
  id: string;
  userId: string;
  medicineId: string;
  quantity: number;
  createdAt: string;
  medicine: Medicine;
}

export interface OrderItem {
  id: string;
  medicineId: string;
  quantity: number;
  price: number;
  medicine: Medicine;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  sellerId: string;
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  medicines: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}