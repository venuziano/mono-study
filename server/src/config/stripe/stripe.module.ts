import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConfigurableModuleClass } from './stripe.config';
import { StripeService } from './stripe.service';

@Global()
@Module({
  providers: [StripeService],
  exports: [StripeService],
  imports: [ConfigModule],
})
export class StripeModule extends ConfigurableModuleClass {}
