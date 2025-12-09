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
import { Response } from 'express';
import { PurchasesService } from '../../application/services/purchases.service';
import { Purchase } from '../../domain/entities/purchase.entity';
import { ListPurchasesDto } from '../../application/dto/list-purchases.dto';
import { SetStatusDto } from '../../application/dto/set-status.dto';

type BatchResult = {
  inserted?: number;
  upserted?: number;
  modified?: number;
  matched?: number;
};

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  // Список с пагинацией/поиском/сортировкой
  @Get()
  async list(@Query() query: ListPurchasesDto) {
    return this.service.list(query);
  }

  // Экспорт в Excel
  @Get('export')
  async export(@Query() query: ListPurchasesDto, @Res() res: Response) {
    const { buffer, filename } = await this.service.export(query);
    const encodedFilename = encodeURIComponent(filename)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
    });

    return res.end(buffer);
  }

  // Получение одной закупки
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Purchase> {
    return this.service.findOne(id);
  }

  // Создание закупки
  @Post()
  async create(@Body() dto: Partial<Purchase>): Promise<Purchase> {
    return this.service.create(dto);
  }

  // Обновление закупки
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<Purchase>
  ): Promise<Purchase> {
    return this.service.update(id, dto);
  }

  // Смена статуса
  @Patch(':id/status')
  @HttpCode(200)
  async setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto
  ): Promise<Purchase> {
    return this.service.setStatus(id, dto.status, dto.comment);
  }

  // Удаление закупки
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { deleted: true };
  }

  // Batch-операции
  @Post('batch')
  @HttpCode(200)
  async batch(
    @Body()
    body: {
      items: Partial<Purchase>[];
      mode?: 'insert' | 'upsert';
      matchBy?: keyof Purchase;
    }
  ): Promise<BatchResult> {
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException('Body.items must be a non-empty array');
    }

    const mode = body.mode ?? 'upsert';
    if (mode === 'insert') {
      throw new BadRequestException('Insert mode is not supported yet');
      // Если захочешь добавить batchInsert, раскомментируй и реализуй в сервисе
      // return this.service.batchInsert(body.items);
    }

    return this.service.batchUpsert(body.items, {
      matchBy: body.matchBy ?? 'entryNumber',
      writeStatusHistoryOnInsert: true,
    });
  }
}
