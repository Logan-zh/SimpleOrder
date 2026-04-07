import { Injectable, NotFoundException } from '@nestjs/common';
import { MenuItem, OrderBatch, OrderItem } from './types';

@Injectable()
export class AppService {
  private menuId = 4;
  private orderId = 1;

  private readonly menuItems: MenuItem[] = [
    {
      id: 1,
      name: '招牌滷肉飯',
      price: 80,
      imageUrl:
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80',
      visible: true,
    },
    {
      id: 2,
      name: '蒜香雞腿排',
      price: 140,
      imageUrl:
        'https://images.unsplash.com/photo-1604908554165-6457d5f4d93f?auto=format&fit=crop&w=900&q=80',
      visible: true,
    },
    {
      id: 3,
      name: '高山烏龍茶',
      price: 40,
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
      visible: true,
    },
  ];

  private readonly orderBatches: OrderBatch[] = [];
  private readonly closedTables = new Set<string>();

  getPublicMenu() {
    return this.menuItems.filter((item) => item.visible);
  }

  getAdminMenu() {
    return this.menuItems;
  }

  createMenuItem(payload: {
    name: string;
    price: number;
    imageUrl: string;
    visible?: boolean;
  }) {
    const item: MenuItem = {
      id: this.menuId++,
      name: payload.name,
      price: payload.price,
      imageUrl: payload.imageUrl,
      visible: payload.visible ?? true,
    };
    this.menuItems.push(item);
    return item;
  }

  updateMenuItem(
    id: number,
    payload: Partial<Pick<MenuItem, 'name' | 'price' | 'imageUrl' | 'visible'>>,
  ) {
    const item = this.menuItems.find((menu) => menu.id === id);
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    if (payload.name !== undefined) {
      item.name = payload.name;
    }
    if (payload.price !== undefined) {
      item.price = payload.price;
    }
    if (payload.imageUrl !== undefined) {
      item.imageUrl = payload.imageUrl;
    }
    if (payload.visible !== undefined) {
      item.visible = payload.visible;
    }

    return item;
  }

  submitOrder(payload: { tableNumber: string; items: OrderItem[] }) {
    this.closedTables.delete(payload.tableNumber);

    const batch: OrderBatch = {
      id: this.orderId++,
      tableNumber: payload.tableNumber,
      items: payload.items,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.orderBatches.push(batch);
    return batch;
  }

  fulfillOrder(orderId: number) {
    const batch = this.orderBatches.find((order) => order.id === orderId);
    if (!batch) {
      throw new NotFoundException('Order batch not found');
    }
    batch.status = 'fulfilled';
    return batch;
  }

  getAdminOrders() {
    return this.orderBatches
      .map((batch) => ({
        ...batch,
        totalAmount: this.calculateBatchAmount(batch.items),
      }))
      .sort((a, b) => b.id - a.id);
  }

  getTableBill(tableNumber: string) {
    const batches = this.orderBatches.filter((order) => order.tableNumber === tableNumber);

    const byMenu = new Map<number, { name: string; quantity: number; unitPrice: number }>();

    for (const batch of batches) {
      for (const item of batch.items) {
        const menu = this.menuItems.find((menuItem) => menuItem.id === item.menuItemId);
        if (!menu) {
          continue;
        }

        const existing = byMenu.get(menu.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          byMenu.set(menu.id, {
            name: menu.name,
            quantity: item.quantity,
            unitPrice: menu.price,
          });
        }
      }
    }

    const items = Array.from(byMenu.values()).map((entry) => ({
      ...entry,
      subtotal: entry.unitPrice * entry.quantity,
    }));

    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);

    return {
      tableNumber,
      closed: this.closedTables.has(tableNumber),
      items,
      totalQuantity,
      totalAmount,
    };
  }

  checkoutTable(tableNumber: string) {
    const bill = this.getTableBill(tableNumber);

    this.orderBatches.splice(
      0,
      this.orderBatches.length,
      ...this.orderBatches.filter((order) => order.tableNumber !== tableNumber),
    );
    this.closedTables.add(tableNumber);

    return {
      message: 'Table checked out',
      closedAt: new Date().toISOString(),
      bill,
    };
  }

  private calculateBatchAmount(items: OrderItem[]) {
    return items.reduce((amount, item) => {
      const menu = this.menuItems.find((menuItem) => menuItem.id === item.menuItemId);
      if (!menu) {
        return amount;
      }
      return amount + menu.price * item.quantity;
    }, 0);
  }
}
