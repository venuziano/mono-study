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
        // type: 'mysql',
        // port: config.dbPort,
        type: 'postgres',
        port: config.pgDBPort,
        host: config.dbHost,
        username: config.dbUsername,
        password: config.dbPassword,
        database: config.dbName,
        autoLoadEntities: true,
        synchronize: config.dbSynchronize,
        logging: true,
      }),
      inject: [AppEnvConfigService], // Inject AppConfigService
    }),
  ],
})
export class DatabaseModule {}

// searching by 'nam': regular pg = 360 ms
// searching by '9': regular pg = 1.6 seconds

// searching by 'nam': regular mysql = 560 ms
// searching by '9': regular mysql = 750 ms
