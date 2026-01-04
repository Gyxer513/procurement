import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PurchaseSite, PurchaseStatus } from '../../domain';

export class ListPurchasesDto {
  @IsOptional() @IsString() q?: string;

  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;

  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsEnum(['asc', 'desc']) sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  completed?: boolean;

  @IsOptional() @IsString() responsible?: string;

  @IsOptional() @IsEnum(PurchaseStatus) status?: PurchaseStatus;
  @IsOptional() @IsEnum(PurchaseSite) site?: PurchaseSite;

  @IsOptional() @IsString() lastStatusChangedFrom?: string;
  @IsOptional() @IsString() lastStatusChangedTo?: string;

  @IsOptional() @IsString() bankGuaranteeFromFrom?: string;
  @IsOptional() @IsString() bankGuaranteeFromTo?: string;
  @IsOptional() @IsString() bankGuaranteeToFrom?: string;
  @IsOptional() @IsString() bankGuaranteeToTo?: string;
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(2025)
  year?: number;

  // '2025-01-01' — валидный ISO8601 date-only, IsDateString пропускает
  @IsOptional()
  @IsDateString()
  dateFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  dateTo?: string; // YYYY-MM-DD
}
