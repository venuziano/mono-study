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

import { getAllBooksDTO } from 'src/dto/book/get.all.book.dto';
import { PaginatedResponseDto } from 'src/dto/pagination/pagination.dto';
import { GetAllBooksPaginatedResponse } from 'src/types/pagination.types';
import { paginationLimit } from 'src/utils/pagination.util';
import { BookService } from '../services/book.service';

@Controller()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('book/get/all')
  @ApiOperation({ summary: 'Get all books' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Optional filter string',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'Max number of items to retrieve',
    type: Number,
    schema: { default: 10 },
  })
  @ApiQuery({
    name: 'page',
    required: true,
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
    @Query('limit', ParseIntPipe) limit: number = paginationLimit,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<GetAllBooksPaginatedResponse> {
    try {
      return await this.bookService.getAllBooks(limit, page, filter);
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('somenthin went wrong');
    }
  }

  @Get('book/get/all2')
  @ApiOperation({ summary: 'Get all books' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Optional filter string',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'Max number of items to retrieve',
    type: Number,
    schema: { default: 10 },
  })
  @ApiQuery({
    name: 'page',
    required: true,
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
  async getAll2(
    @Query('filter') filter?: string,
    @Query('limit', ParseIntPipe) limit: number = paginationLimit,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<GetAllBooksPaginatedResponse> {
    try {
      return await this.bookService.getAllBooks2(limit, page, filter);
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('somenthin went wrong');
    }
  }
}
