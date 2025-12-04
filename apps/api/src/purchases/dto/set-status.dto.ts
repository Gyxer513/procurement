import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PurchaseStatus } from '../schemas/purchase.schema';

export class SetStatusDto {
  @IsEnum(PurchaseStatus)
  status!: PurchaseStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
