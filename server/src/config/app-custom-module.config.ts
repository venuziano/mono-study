import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { AppEnvConfigService } from './environment-variables/app-env.config';
import { AppController } from 'src/app.controller';
import { DepositModule } from 'src/deposit/deposit.module';
import { AppService } from 'src/app.service';

@Global()
@Module({
  imports: [NestConfigModule.forRoot(), DepositModule],
  controllers: [AppController],
  providers: [AppEnvConfigService, AppService],
  exports: [AppEnvConfigService],
})
export class ConfigModule {}
