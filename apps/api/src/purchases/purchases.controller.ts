import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Purchase } from './schemas/purchase.schema';
import { ListPurchasesDto } from './dto/list-purchases.dto';
import type { Response } from 'express';
import { SetStatusDto } from './dto/set-status.dto';
import { PurchaseLean } from './schemas/purchaseVirtuals.types';

type BatchResult = {
  inserted?: number;
  upserted?: number;
  modified?: number;
  matched?: number;
};

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  // список с пагинацией/поиском/сортировкой
  @Get()
  async list(@Query() query: ListPurchasesDto) {
    return this.service.list(query);
  }

  // экспорт в Excel
  @Get('export')
  async export(@Query() query: ListPurchasesDto, @Res() res: Response) {
    const { buffer, filename } = await this.service.export(query);
    // Безопасное кодирование имени файла для заголовка Content-Disposition
    const encodedFilename = encodeURIComponent(filename)
      .replace(/'/g, '%27') // Заменяем одинарные кавычки
      .replace(/"/g, '%22'); // Заменяем двойные кавычки
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
    });
    return res.end(buffer);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<PurchaseLean> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<Purchase>): Promise<PurchaseLean> {
    return this.service.create(dto);
  }

  // фронт вызывает PATCH
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<Purchase>
  ): Promise<PurchaseLean> {
    return this.service.update(id, dto);
  }

  // смена статуса с комментариями
  @Patch(':id/status')
  @HttpCode(200)
  setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto
  ): Promise<PurchaseLean> {
    return this.service.setStatus(id, dto.status, dto.comment);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { deleted: true };
  }

  // batch: принимает JSON с Excel, распарсенный на фронте
  @Post('batch')
  @HttpCode(200)
  async batch(
    @Body()
    body: {
      items: Partial<Purchase>[];
      mode?: 'insert' | 'upsert';
      matchBy?: keyof Purchase; // для upsert, по умолчанию 'entryNumber'
    }
  ): Promise<BatchResult> {
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException('Body.items must be a non-empty array');
    }
    const mode = body.mode ?? 'upsert';
    if (mode === 'insert') {
      return this.service.batchInsert(body.items);
    }
    return this.service.batchUpsert(body.items, {
      matchBy: (body.matchBy as any) ?? 'entryNumber',
      writeStatusHistoryOnInsert: true,
    });
  }
}
