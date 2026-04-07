import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateMenuItemDto, UpdateMenuItemDto } from './menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemRepository.find();
  }

  async findAvailable(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({ where: { isAvailable: true } });
  }

  async findOne(id: number): Promise<MenuItem> {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`MenuItem #${id} not found`);
    return item;
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = this.menuItemRepository.create({
      ...dto,
      isAvailable: dto.isAvailable ?? true,
    });
    return this.menuItemRepository.save(item);
  }

  async update(id: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    await this.findOne(id);
    await this.menuItemRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.menuItemRepository.delete(id);
  }
}
