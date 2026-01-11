import { Injectable } from '@nestjs/common';
import { IEntryNumberService } from '../../entities/entry-number.service.interface';

@Injectable()
export class EntryNumberService implements IEntryNumberService {
  async nextPurchaseEntryNumber(): Promise<string> {
    return `AUTO-${Date.now()}`;
  }
}
