import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { DepositModule } from './deposit/deposit.module';
import { CustomerModule } from './customer/customer.module';
import { StripeModule } from './config/stripe/stripe.module';
import { AppEnvConfigService } from './config/environment-variables/app-env.config';
import { PaymentModule } from './payment/payment.module';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    // External Modules
    ConfigModule.forRoot(),

    // Application Modules
    CustomerModule,
    DepositModule,
    PaymentModule,
    BookModule,

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
    PaymentModule,
  ],
})
export class AppModule {}
