import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Res } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Purchase } from './schemas/purchase.schema';
import { ListPurchasesDto } from './dto/list-purchases.dto';
import type { Response } from 'express';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

// список с пагинацией/поиском/сортировкой
  @Get()
  async list(@Query() query: ListPurchasesDto) {
    return this.service.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Purchase> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<Purchase>): Promise<Purchase> {
    return this.service.create(dto);
  }

// фронт вызывает PATCH
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<Purchase>): Promise<Purchase> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { deleted: true };
  }

// экспорт в Excel
  @Get('export')
  async export(@Query() query: ListPurchasesDto, @Res() res: Response) {
    const { buffer, filename } = await this.service.export(query);
    // Безопасное кодирование имени файла для заголовка Content-Disposition
    const encodedFilename = encodeURIComponent(filename)
      .replace(/'/g, '%27')  // Заменяем одинарные кавычки
      .replace(/"/g, '%22'); // Заменяем двойные кавычки
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
    });
    return res.end(buffer);
  }
}
