import { Injectable } from '@nestjs/common';
import { IEntryNumberService } from '../../entities/entry-number.service.interface';

@Injectable()
export class EntryNumberService implements IEntryNumberService {
  async nextPurchaseEntryNumber(): Promise<string> {
    // временно. правильнее сделать sequence/counter в БД (атомарно)
    return `AUTO-${Date.now()}`;
  }
}
