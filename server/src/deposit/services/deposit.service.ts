import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deposit } from '../../entity/deposit.entity';
import { DepositDTO } from '../../dto/deposit.dto';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
  ) {}

  async syncDeposit(deposit: DepositDTO) {
    await this.depositRepository.save({
      ...deposit,
      depositDate: new Date().toISOString(),
    });
  }
}
