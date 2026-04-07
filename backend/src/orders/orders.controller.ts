import {
  Controller, Get, Post, Patch,
  Param, Body, ParseIntPipe, ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 後台: 所有訂單
  @Get()
  getAll() {
    return this.ordersService.findAll();
  }

  // 前台: 查某桌訂單
  @Get('table/:tableNumber')
  getByTable(@Param('tableNumber', ParseIntPipe) tableNumber: number) {
    return this.ordersService.findByTable(tableNumber);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // 前台: 送出訂單
  @Post()
  create(@Body(new ValidationPipe({ transform: true })) dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // 後台: 確認送餐
  @Patch(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.confirm(id);
  }

  // 後台: 核銷單筆訂單
  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.complete(id);
  }

  // 後台: 核銷整桌單據
  @Patch('table/:tableNumber/complete')
  completeTable(@Param('tableNumber', ParseIntPipe) tableNumber: number) {
    return this.ordersService.completeTable(tableNumber);
  }

  // 後台: 取消訂單
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(id);
  }
}
