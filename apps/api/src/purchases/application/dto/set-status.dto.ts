import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';

export class SetStatusDto {
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
