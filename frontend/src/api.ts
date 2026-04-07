import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  tableNumber: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  tableNumber: number;
  items: { menuItemId: number; quantity: number }[];
}

// Menu APIs
export const getAvailableMenu = () => api.get<MenuItem[]>('/menu/available');
export const getAllMenu = () => api.get<MenuItem[]>('/menu');
export const createMenuItem = (data: Partial<MenuItem>) => api.post<MenuItem>('/menu', data);
export const updateMenuItem = (id: number, data: Partial<MenuItem>) => api.patch<MenuItem>(`/menu/${id}`, data);
export const deleteMenuItem = (id: number) => api.delete(`/menu/${id}`);

// Order APIs
export const getAllOrders = () => api.get<Order[]>('/orders');
export const getTableOrders = (tableNumber: number) => api.get<Order[]>(`/orders/table/${tableNumber}`);
export const createOrder = (data: CreateOrderPayload) => api.post<Order>('/orders', data);
export const confirmOrder = (id: number) => api.patch<Order>(`/orders/${id}/confirm`);
export const completeOrder = (id: number) => api.patch<Order>(`/orders/${id}/complete`);
export const completeTable = (tableNumber: number) => api.patch<Order[]>(`/orders/table/${tableNumber}/complete`);
export const cancelOrder = (id: number) => api.patch<Order>(`/orders/${id}/cancel`);
