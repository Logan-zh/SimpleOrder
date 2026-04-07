export interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  visible: boolean;
}

export interface OrderItem {
  menuItemId: number;
  quantity: number;
}

export interface OrderBatch {
  id: number;
  tableNumber: string;
  items: OrderItem[];
  status: 'pending' | 'fulfilled';
  createdAt: string;
}
