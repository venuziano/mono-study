import { Injectable } from '@nestjs/common';

import { StripeService } from 'src/config/stripe/stripe.service';

@Injectable()
export class PaymentService {
  constructor(private readonly stripeService: StripeService) {}

  async createPayment() {
    const createdPayment =
      await this.stripeService.stripe.paymentIntents.create({
        amount: 4000,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        payment_method: 'pm_1OmnyDE1II2aXPtCKjQkWBJ0',
        customer: 'cus_PbffhIxxQLHbrJ',
      });

    return this.stripeService.stripe.paymentIntents.confirm(createdPayment.id, {
      payment_method: createdPayment.payment_method as string,
    });
  }
}
