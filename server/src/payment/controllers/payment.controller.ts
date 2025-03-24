import { BadRequestException, Controller, Post } from '@nestjs/common';

import { PaymentService } from '../services/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/create')
  async createPayment() {
    // async createPayment(@Body() deposit: DepositDTO) {
    try {
      const createdPayment = await this.paymentService.createPayment();

      // console.log(amount, depositCode);
      return { createdPayment };
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('somenthin went wrong');
    }
  }
}
