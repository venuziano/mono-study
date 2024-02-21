import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { DepositService } from '../services/deposit.service';
import { DepositDTO } from '../../dto/deposit.dto';

@Controller()
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post('/deposit')
  async syncDeposit(@Body() deposit: DepositDTO) {
    try {
      await this.depositService.syncDeposit(deposit);

      const { amount, depositCode } = deposit;
      console.log(amount, depositCode);
      return { amount, depositCode };
    } catch (error) {
      console.log('error', error)
      throw new BadRequestException('somenthin went wrong');
    }
  }
}
