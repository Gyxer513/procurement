import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PurchaseStatus } from 'shared';

export class SetStatusDto {
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
