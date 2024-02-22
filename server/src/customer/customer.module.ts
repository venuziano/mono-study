import { Module } from '@nestjs/common';

import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
