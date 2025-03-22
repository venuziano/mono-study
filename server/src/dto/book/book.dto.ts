import { ApiProperty } from '@nestjs/swagger';
import { Deposit } from '../../entity/deposit.entity';

export class DepositDTO {
  @ApiProperty({
    description: 'A unique code identifying the deposit transaction.',
    example: 'DEP123456',
  })
  depositCode: string;

  @ApiProperty({ description: 'The amount of the deposit.', example: 1000 })
  amount: number;

  constructor(deposit: Deposit) {
    this.depositCode = deposit.depositCode;
    this.amount = deposit.amount;
  }
}
