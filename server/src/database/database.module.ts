import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from 'src/config/app-custom-module.config';
import { AppEnvConfigService } from 'src/config/environment-variables/app-env.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import the module that provides AppConfigService
      useFactory: (config: AppEnvConfigService) => ({
        type: 'mysql',
        host: config.dbHost,
        port: config.dbPort,
        username: config.dbUsername,
        password: config.dbPassword,
        database: config.dbName,
        autoLoadEntities: true,
        synchronize: config.dbSynchronize,
      }),
      inject: [AppEnvConfigService], // Inject AppConfigService
    }),
  ],
})
export class DatabaseModule {}
