import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';
import { OrderItem } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getFrontPage(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('/admin')
  getAdminPage(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'admin.html'));
  }

  @Get('/api/menu')
  getPublicMenu() {
    return this.appService.getPublicMenu();
  }

  @Get('/api/admin/menu')
  getAdminMenu() {
    return this.appService.getAdminMenu();
  }

  @Post('/api/admin/menu')
  createMenu(
    @Body()
    body: {
      name: string;
      price: number;
      imageUrl: string;
      visible?: boolean;
    },
  ) {
    if (!body.name || !body.imageUrl || body.price === undefined) {
      throw new BadRequestException('name, price and imageUrl are required');
    }
    return this.appService.createMenuItem(body);
  }

  @Patch('/api/admin/menu/:id')
  updateMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      price?: number;
      imageUrl?: string;
      visible?: boolean;
    },
  ) {
    return this.appService.updateMenuItem(id, body);
  }

  @Post('/api/orders/submit')
  submitOrder(
    @Body()
    body: {
      tableNumber: string;
      items: OrderItem[];
    },
  ) {
    if (!body.tableNumber) {
      throw new BadRequestException('tableNumber is required');
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException('items is required');
    }

    const normalizedItems = body.items
      .filter((item) => item && Number.isInteger(item.menuItemId) && Number.isInteger(item.quantity))
      .map((item) => ({ menuItemId: item.menuItemId, quantity: Math.max(1, item.quantity) }));

    if (normalizedItems.length === 0) {
      throw new BadRequestException('items is invalid');
    }

    return this.appService.submitOrder({
      tableNumber: body.tableNumber,
      items: normalizedItems,
    });
  }

  @Get('/api/admin/orders')
  getAdminOrders() {
    return this.appService.getAdminOrders();
  }

  @Patch('/api/admin/orders/:id/fulfill')
  fulfillOrder(@Param('id', ParseIntPipe) id: number) {
    return this.appService.fulfillOrder(id);
  }

  @Get('/api/tables/:tableNumber/bill')
  getTableBill(@Param('tableNumber') tableNumber: string) {
    return this.appService.getTableBill(tableNumber);
  }

  @Post('/api/tables/:tableNumber/checkout')
  checkoutTable(@Param('tableNumber') tableNumber: string) {
    return this.appService.checkoutTable(tableNumber);
  }
}
