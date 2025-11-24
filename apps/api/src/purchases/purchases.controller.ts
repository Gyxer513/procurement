import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Purchase } from './schemas/purchase.schema';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  @Get()
  findAll(): Promise<Purchase[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Purchase> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<Purchase>): Promise<Purchase> {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<Purchase>): Promise<Purchase> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
