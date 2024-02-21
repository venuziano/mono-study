import { Deposit } from '../entity/deposit.entity';

export class DepositDTO {
  depositCode: string;
  amount: number;

  constructor(deposit: Deposit) {
    this.depositCode = deposit.depositCode;
    this.amount = deposit.amount;
  }
}
