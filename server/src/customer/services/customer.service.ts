import { Injectable } from '@nestjs/common';

import { StripeService } from 'src/config/stripe/stripe.service';

@Injectable()
export class CustomerService {
  constructor(private readonly stripeService: StripeService) {}

  getCustomers() {
    return this.stripeService.stripe.customers.list();
  }

  getCustomerByID(customerID: string) {
    return this.stripeService.stripe.customers.retrieve(customerID)
    // return this.stripeService.stripe.customers.search({
    //   query: `email:'${email}'`
    // })
  }
}
