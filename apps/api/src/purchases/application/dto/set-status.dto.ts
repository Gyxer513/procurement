import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PurchaseStatus } from '../../infrastructure/schemas/purchase.schema';

export class SetStatusDto {
  @IsEnum(PurchaseStatus)
  status!: PurchaseStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
