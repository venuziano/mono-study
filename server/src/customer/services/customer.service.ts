import { Injectable } from '@nestjs/common';

import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class CustomerService {
  constructor(private readonly stripeService: StripeService) {}

  getCustomers() {
    return this.stripeService.stripe.customers.list();
  }
}
