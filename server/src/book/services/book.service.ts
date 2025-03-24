import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from 'src/entity/book.entity';
import { getAllBooksDTO } from 'src/dto/book/get.all.book.dto';
import { GetAllBooksPaginatedResponse } from 'src/types/pagination.types';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  /**
   * Retrieve all books with their categories, applying an optional filter and pagination.
   *
   * @param limit Maximum number of records per page.
   * @param page Current page number.
   * @param filter Optional filter string to search by book name.
   * @returns A paginated response containing the mapped book DTOs.
   */
  async getAllBooks(
    // skip: number = 0,
    limit: number,
    page: number,
    filter?: string,
  ): Promise<GetAllBooksPaginatedResponse> {
    // Calculate the offset using the page number and limit
    const offset = (page - 1) * limit;

    // Build the query to join the bookCategories and then the category itself
    const query = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.bookCategories', 'bookCategory')
      .leftJoinAndSelect('bookCategory.category', 'category');

    // Apply filtering on the book name if provided
    if (filter) {
      // const fullTextFilter = `${filter}*`;
      // query.where(
      //   'MATCH(book.name) AGAINST(:filter IN BOOLEAN MODE) OR EXISTS (SELECT 1 FROM book_categories bc JOIN category c ON bc.category_id = c.id WHERE bc.book_id = book.id AND MATCH(c.name) AGAINST(:filter IN BOOLEAN MODE))',
      //   { filter: fullTextFilter },
      // );
      query.where(
        'book.name LIKE :filter OR EXISTS (SELECT 1 FROM book_categories bc JOIN category c ON bc.category_id = c.id WHERE bc.book_id = book.id AND c.name LIKE :filter)',
        { filter: `${filter}%` },
      );
    }

    // Apply pagination
    query.skip(offset).take(limit);

    // Execute the query and get [data, total] count
    const [books, total] = await query.getManyAndCount();

    // Map the raw Book entities to your DTOs
    const data = books.map((book) => new getAllBooksDTO(book));

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
