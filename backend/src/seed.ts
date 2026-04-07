import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MenuService } from './menu/menu.service';

const SEED_MENU = [
  { name: '招牌牛肉麵', description: '精燉12小時紅燒牛肉，麵條Q彈', price: 180, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
  { name: '滷肉飯', description: '古早味三層肉燥，香氣四溢', price: 60, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
  { name: '排骨便當', description: '酥炸排骨配白飯、燙青菜', price: 110, imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
  { name: '蛤蜊湯', description: '新鮮蛤蜊薑絲清湯', price: 70, imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
  { name: '水餃（10顆）', description: '手工豬肉高麗菜水餃', price: 80, imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400' },
  { name: '炒青菜', description: '當季時蔬大火快炒', price: 50, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
  { name: '珍珠奶茶', description: '濃醇奶茶搭配QQ珍珠', price: 55, imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400' },
  { name: '木瓜牛奶', description: '新鮮木瓜現打，香甜順口', price: 60, imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400' },
  { name: '控肉飯', description: '入口即化焢肉，淋上濃郁醬汁', price: 90, imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400' },
  { name: '麻辣豆腐', description: '嫩豆腐佐自製麻辣醬，香辣過癮', price: 85, imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400' },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const menuService = app.get(MenuService);

  const existing = await menuService.findAll();
  if (existing.length > 0) {
    console.log(`⏭️  菜單已有 ${existing.length} 筆資料，跳過 seed`);
    await app.close();
    return;
  }

  console.log('🌱 開始匯入菜單...');
  for (const item of SEED_MENU) {
    await menuService.create(item);
    console.log(`  ✅ ${item.name} (NT$${item.price})`);
  }
  console.log('🎉 匯入完成，共 10 筆菜單');

  await app.close();
}

bootstrap();
