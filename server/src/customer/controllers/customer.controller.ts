import { BadRequestException, Controller, Get } from '@nestjs/common';

import { CustomerService } from '../services/customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('/')
  async syncDeposit() {
    try {
      const customers = await this.customerService.getCustomers();

      // console.log(amount, depositCode);
      return { customers };
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('somenthin went wrong');
    }
  }

  @Get('get/by/id')
  async getCustomerByID() {
    try {
      const customers = await this.customerService.getCustomerByID('cus_PbffhIxxQLHbrJ');

      // console.log(amount, depositCode);
      return { customers };
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('somenthin went wrong');
    }
  }
}
