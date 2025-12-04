import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import {PurchasesModule} from "../purchases/purchases.module";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI), PurchasesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
