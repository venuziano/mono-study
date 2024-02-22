import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { DepositModule } from './deposit/deposit.module';
import { CustomerModule } from './customer/customer.module';
import { StripeModule } from './stripe/stripe.module';
import { AppEnvConfigService } from './config/environment-variables/app-env.config';

@Module({
  imports: [
    // External Modules
    ConfigModule.forRoot(),

    // Application Modules
    CustomerModule,
    DepositModule,

    // Config modules
    DatabaseModule,
    StripeModule.forRootAsync({
      useFactory: (config: AppEnvConfigService) => ({
        apiKey: config.stripeAPIKey, // Ensure async operations are handled if needed
        options: {
          apiVersion: '2023-10-16',
        },
      }),
      inject: [AppEnvConfigService],
    }),
  ],
})
export class AppModule {}
