import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purchase } from './schemas/purchase.schema';

@Injectable()
export class PurchasesService {
  constructor(@InjectModel(Purchase.name) private model: Model<Purchase>) {}

  async findAll() {
    return this.model.find().exec();
  }

  async findOne(id: string) {
    return this.model.findById(id).exec();
  }

  async create(data: Partial<Purchase>) {
    return this.model.create(data);
  }

  async update(id: string, data: Partial<Purchase>) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
