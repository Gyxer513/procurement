import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PurchasesService } from '../../application/services/purchases.service';
import { Purchase } from '../../domain/entities/purchase.entity';
import { ListPurchasesDto } from '../../application/dto/list-purchases.dto';
import { SetStatusDto } from '../../application/dto/set-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../../../auth/roles.guard';
import { BatchResult } from '../../domain/entities/BatchResult.type';
import { Role } from '../../../auth/roles';
import { SetDeletedDto } from '../../application/dto/set-deleted.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  // Просмотр списка: всем ролям (инициатор потом будет фильтроваться "только своё")
  @Roles(
    Role.SeniorAdmin,
    Role.Admin,
    Role.Procurement,
    Role.Initiator,
    Role.Statistic
  )
  @Get()
  async list(@Query() query: ListPurchasesDto) {
    return this.service.list(query);
  }

  // Экспорт: обычно только статист/закупки/админы
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement, Role.Statistic)
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

  // Просмотр одной: всем ролям (инициатор позже будет проверяться на "свою")
  @Roles(
    Role.SeniorAdmin,
    Role.Admin,
    Role.Procurement,
    Role.Initiator,
    Role.Statistic
  )
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Purchase> {
    return this.service.findOne(id);
  }

  // Создание: закупки/инициатор/админы
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement, Role.Initiator)
  @Post()
  async create(@Body() dto: Partial<Purchase>): Promise<Purchase> {
    return this.service.create(dto);
  }

  // Обновление: закупки/инициатор/админы (ограничение "инициатор только своё" позже)
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement, Role.Initiator)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<Purchase>
  ): Promise<Purchase> {
    return this.service.update(id, dto);
  }

  @Roles(Role.SeniorAdmin)
  @Get('deleted')
  listDeleted(@Query() dto: any) {
    return this.service.listDeleted(dto);
  }

  // Смена статуса: обычно только закупки/админы (инициатору не даём)
  @Roles(Role.SeniorAdmin, Role.Admin, Role.Procurement)
  @Patch(':id/status')
  @HttpCode(200)
  async setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto
  ): Promise<Purchase> {
    return this.service.setStatus(id, dto.status, dto.comment);
  }

  // Удаление: админы
  @Roles(Role.SeniorAdmin)
  @Patch(':id/deleted')
  @HttpCode(200)
  async setDeleted(
    @Param('id') id: string,
    @Body() dto: SetDeletedDto
  ): Promise<Purchase> {
    return this.service.setDeleted(id, dto.isDeleted);
  }

  // Batch: только senior_admin
  @Roles(Role.SeniorAdmin)
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
    }

    return this.service.batchUpsert(body.items, {
      matchBy: body.matchBy ?? 'entryNumber',
      writeStatusHistoryOnInsert: true,
    });
  }
}
