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

    const tsquery = filter.trim().split(/\s+/).join(' & ');

    // Build the query to join the bookCategories and then the category itself
    const query = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.bookCategories', 'bookCategory')
      .leftJoinAndSelect('bookCategory.category', 'category');

    const query2 = this.bookRepository
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
      // query.where('book.name LIKE :filter', { filter: `${filter}%` }).orWhere(
      //   new Brackets((qb) => {
      //     qb.where(
      //       'EXISTS (SELECT 1 FROM book_categories bc JOIN category c ON bc.category_id = c.id WHERE bc.book_id = book.id AND c.name LIKE :filter)',
      //       { filter: `%${filter}%` },
      //     );
      //   }),
      // );
      // query.where(
      //   "to_tsvector('english', book.name) @@ plainto_tsquery('english', :filter) OR EXISTS (" +
      //     'SELECT 1 FROM book_categories bc JOIN category c ON bc.category_id = c.id ' +
      //     "WHERE bc.book_id = book.id AND to_tsvector('english', c.name) @@ plainto_tsquery('english', :filter)" +
      //     ')',
      //   { filter },
      // );
      query2.where(
        'book.name ILIKE :filter OR EXISTS (SELECT 1 FROM book_categories bc JOIN category c ON bc.category_id = c.id WHERE bc.book_id = book.id AND c.name ILIKE :filter)',
        // 'book.name LIKE :filter OR EXISTS (SELECT 1 FROM book_categories bc JOIN category c ON bc.category_id = c.id WHERE bc.book_id = book.id AND c.name LIKE :filter)',
        { filter: `%${filter}%` },
      );

      query.where(
        `to_tsvector('english', book.name) @@ to_tsquery('english', :tsquery)
         OR EXISTS (
            SELECT 1
            FROM book_categories bc
            JOIN category c ON bc.category_id = c.id
            WHERE bc.book_id = book.id
              AND to_tsvector('english', c.name) @@ to_tsquery('english', :tsquery)
         )`,
        { tsquery },
      );
    }

    // Apply pagination
    // query2.skip(offset).take(limit);
    query.skip(offset).take(limit);
    console.log('query', query.getSql());
    const books = await query.getMany();
    const rawCountQuery = `
      SELECT COUNT(*) AS count
      FROM (
        SELECT id
        FROM book
        WHERE to_tsvector('english', name) @@ to_tsquery('english', $1)

        UNION

        SELECT b.id
        FROM book b
        JOIN book_categories bc ON bc.book_id = b.id
        JOIN category c ON c.id = bc.category_id
        WHERE to_tsvector('english', c.name) @@ to_tsquery('english', $1)
      ) AS matching_books;
    `;
    const resultRawCountQuery = await this.bookRepository.query(rawCountQuery, [
      tsquery,
    ]);
    const total = parseInt(resultRawCountQuery[0].count, 10);
    //   console.log('total', total);
    // const [books, total] = await query2.getManyAndCount();

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

  /**
   * Retrieve all books with their categories, applying an optional filter and pagination.
   *
   * @param limit Maximum number of records per page.
   * @param page Current page number.
   * @param filter Optional filter string to search by book name.
   * @returns A paginated response containing the mapped book DTOs.
   */
  async getAllBooks2(
    // skip: number = 0,
    limit: number,
    page: number,
    filter?: string,
  ): Promise<GetAllBooksPaginatedResponse> {
    const offset = (page - 1) * limit;

    const countQuery = `
  SELECT COUNT(DISTINCT \`book\`.\`id\`) as total
  FROM \`book\` \`book\`
  LEFT JOIN \`book_categories\` \`bookCategory\` ON \`bookCategory\`.\`book_id\` = \`book\`.\`id\`
  LEFT JOIN \`category\` \`category\` ON \`category\`.\`id\` = \`bookCategory\`.\`category_id\`
  WHERE \`book\`.\`name\` LIKE ? OR EXISTS (
    SELECT 1 FROM book_categories bc
    JOIN category c ON bc.category_id = c.id
    WHERE bc.book_id = \`book\`.\`id\` AND c.name LIKE ?
  )
`;

    const dataQuery = `
  SELECT 
    \`book\`.\`id\` AS \`book_id\`,
    \`book\`.\`name\` AS \`book_name\`,
    \`bookCategory\`.\`book_id\` AS \`bookCategory_book_id\`,
    \`bookCategory\`.\`category_id\` AS \`bookCategory_category_id\`,
    \`category\`.\`id\` AS \`category_id\`,
    \`category\`.\`name\` AS \`category_name\`
  FROM \`book\` \`book\`
  LEFT JOIN \`book_categories\` \`bookCategory\` ON \`bookCategory\`.\`book_id\` = \`book\`.\`id\`
  LEFT JOIN \`category\` \`category\` ON \`category\`.\`id\` = \`bookCategory\`.\`category_id\`
  WHERE \`book\`.\`name\` LIKE ? OR EXISTS (
    SELECT 1 FROM book_categories bc
    JOIN category c ON bc.category_id = c.id
    WHERE bc.book_id = \`book\`.\`id\` AND c.name LIKE ?
  )
  LIMIT ? OFFSET ?
`;

    // Execute both queries concurrently
    const [countResult, data] = await Promise.all([
      this.bookRepository.query(countQuery, [`%${filter}%`, `%${filter}%`]),
      this.bookRepository.query(dataQuery, [
        `%${filter}%`,
        `%${filter}%`,
        limit,
        offset,
      ]),
    ]);

    const total = parseInt(countResult[0].total, 10);
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
