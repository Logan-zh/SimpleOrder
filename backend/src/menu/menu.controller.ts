import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, ValidationPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 前台: 取得所有上架菜單
  @Get('available')
  getAvailable() {
    return this.menuService.findAvailable();
  }

  // 後台: 取得全部菜單(含下架)
  @Get()
  getAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  // 後台: 新增菜色
  @Post()
  create(@Body(new ValidationPipe()) dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  // 後台: 更新菜色(含顯示/隱藏)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) dto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, dto);
  }

  // 後台: 刪除菜色
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
