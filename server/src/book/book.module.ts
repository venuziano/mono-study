import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from '../entity/deposit.entity';
import { DepositController } from './controllers/book.controller';
import { DepositService } from './services/book.service';

@Module({
  imports: [TypeOrmModule.forFeature([Deposit])],
  controllers: [DepositController],
  providers: [DepositService],
})
export class BookModule {}
