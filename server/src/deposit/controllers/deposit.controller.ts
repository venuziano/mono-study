import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { DepositDTO } from '../../dto/deposit.dto';
import { DepositService } from '../services/deposit.service';

@Controller()
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post('/deposit')
  @ApiOperation({ summary: 'Synchronize a deposit transaction' })
  @ApiResponse({ status: 200, description: 'Deposit synchronized successfully', type: DepositDTO })
  @ApiBadRequestResponse({ description: 'Something went wrong' })
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
