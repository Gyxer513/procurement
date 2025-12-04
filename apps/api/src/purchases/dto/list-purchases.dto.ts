import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { PurchaseSite, PurchaseStatus } from '../schemas/purchase.schema';

export class ListPurchasesDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'sortOrder must be asc or desc' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  responsible?: string;

  // Новые поля фильтрации
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @IsOptional()
  @IsEnum(PurchaseSite)
  site?: PurchaseSite;

  // Диапазон по дате последнего изменения статуса
  @IsOptional()
  @IsString()
  lastStatusChangedFrom?: string;

  @IsOptional()
  @IsString()
  lastStatusChangedTo?: string;

  // Диапазоны по сроку действия БГ
  @IsOptional()
  @IsString()
  bankGuaranteeFromFrom?: string;

  @IsOptional()
  @IsString()
  bankGuaranteeFromTo?: string;

  @IsOptional()
  @IsString()
  bankGuaranteeToFrom?: string;

  @IsOptional()
  @IsString()
  bankGuaranteeToTo?: string;
}
