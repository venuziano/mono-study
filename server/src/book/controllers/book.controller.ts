import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { PaginatedResponse } from 'src/types/pagination';
import { PaginatedResponseDto } from 'src/dto/pagination/pagination.dto';
import { getAllBooksDTO } from 'src/dto/book/get.all.book.dto';

@Controller()
export class BookController {
  // constructor(private readonly depositService: DepositService) {}

  @Get('book/get/all')
  @ApiOperation({ summary: 'Get all books' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Optional filter string',
    type: String,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of items to skip',
    type: Number,
    schema: { default: 0 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max number of items to retrieve',
    type: Number,
    schema: { default: 10 },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Current page number',
    type: Number,
    schema: { default: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'List retrieved successfully!',
    type: PaginatedResponseDto(getAllBooksDTO),
  })
  @ApiBadRequestResponse({ description: 'Something went wrong' })
  async getAll(
    @Query('filter') filter?: string,
    @Query('skip', ParseIntPipe) skip: number = 0,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponse<getAllBooksDTO>> {
    try {
      console.log('filter', filter);
      console.log('skip', skip);
      console.log('limit', limit);
      console.log('page', page);
      // await this.depositService.syncDeposit(deposit);

      // const { amount, depositCode } = deposit;
      // console.log(amount, depositCode);
      // return { amount, depositCode };
      return {} as PaginatedResponse<getAllBooksDTO>;
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('somenthin went wrong');
    }
  }
}
