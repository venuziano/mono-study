import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { DepositModule } from './deposit/deposit.module';

@Module({
  imports: [DatabaseModule, DepositModule, ConfigModule.forRoot()],
})
export class AppModule {}
