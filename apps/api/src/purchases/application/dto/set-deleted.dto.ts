import { IsBoolean } from 'class-validator';

export class SetDeletedDto {
  @IsBoolean()
  isDeleted!: boolean;
}
