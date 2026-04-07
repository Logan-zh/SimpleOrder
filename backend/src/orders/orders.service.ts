import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { MenuService } from '../menu/menu.service';
import { CreateOrderDto } from './orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private menuService: MenuService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByTable(tableNumber: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { tableNumber },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const itemDto of dto.items) {
      const menuItem = await this.menuService.findOne(itemDto.menuItemId);
      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is not available`);
      }
      const orderItem = this.orderItemRepository.create({
        menuItem,
        quantity: itemDto.quantity,
        unitPrice: menuItem.price,
      });
      orderItems.push(orderItem);
      total += Number(menuItem.price) * itemDto.quantity;
    }

    const order = this.orderRepository.create({
      tableNumber: dto.tableNumber,
      items: orderItems,
      totalAmount: total,
      status: OrderStatus.PENDING,
    });

    return this.orderRepository.save(order);
  }

  async confirm(id: number): Promise<Order> {
    const order = await this.findOne(id);
    order.status = OrderStatus.CONFIRMED;
    return this.orderRepository.save(order);
  }

  // 核銷單張訂單
  async complete(id: number): Promise<Order> {
    const order = await this.findOne(id);
    order.status = OrderStatus.COMPLETED;
    return this.orderRepository.save(order);
  }

  // 核銷整張桌號單據
  async completeTable(tableNumber: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { tableNumber, status: OrderStatus.CONFIRMED },
    });
    for (const order of orders) {
      order.status = OrderStatus.COMPLETED;
    }
    return this.orderRepository.save(orders);
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.findOne(id);
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
