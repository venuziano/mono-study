import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from 'src/entity/book.entity';
import { getAllBooksDTO } from 'src/dto/book/get.all.book.dto';
import { GetAllBooksPaginatedResponse } from 'src/types/pagination.types';
import { tsquery } from 'src/utils/filter.util';

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
   * @param sort Optional sort field.
   * @param order Optional sort order (ASC or DESC).
   * @returns A paginated response containing the mapped book DTOs.
   */
  async getAllBooks(
    limit: number,
    page: number,
    filter?: string,
    sort?: string,
    order?: string,
  ): Promise<GetAllBooksPaginatedResponse> {
    const allowedSortFields: string[] = [
      'name',
      'author',
      'publisher',
      'publication_date',
      'page_count',
      'created_at',
      'updated_at',
    ];

    // Prevent SQL injection
    if (sort && !allowedSortFields.includes(sort)) {
      throw new Error('Invalid sort field');
    }

    const allowedSortOrders: string[] = ['ASC', 'DESC'];
    if (order && !allowedSortOrders.includes(order.toUpperCase())) {
      throw new Error('Invalid sort order');
    }

    const sortField: string =
      sort && allowedSortFields.includes(sort) ? sort : 'updated_at';

    const sortOrder: 'ASC' | 'DESC' =
      order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const offset: number = (page - 1) * limit;

    const rawQueryUsingFilter: string = `
    SELECT
      *,
      (
        SELECT jsonb_agg(jsonb_build_object('category', to_jsonb(c.*)))
        FROM book_categories bc
        JOIN category c ON c.id = bc.category_id
        WHERE bc.book_id = b.id
      ) AS "bookCategories"
    FROM (
      SELECT
        *
      FROM book b
      WHERE to_tsvector('english', coalesce(b.name, '') || ' ' || coalesce(b.author, '') || ' ' || coalesce(b.publisher, ''))
            @@ to_tsquery('english', $1)
      UNION
      SELECT
        *                
      FROM book b
      WHERE EXISTS (
        SELECT 1
        FROM book_categories bc
        JOIN category c ON c.id = bc.category_id
        WHERE bc.book_id = b.id
          AND to_tsvector('english', c.name) @@ to_tsquery('english', $1)
      )
    ) b
    ORDER BY b.${sortField} ${sortOrder}
    LIMIT $2 OFFSET $3;
  `;

    const rawQueryWithoutFilter: string = `
      SELECT
      b.*,
      (
        SELECT jsonb_agg(jsonb_build_object('category', to_jsonb(c.*)))
        FROM book_categories bc
        JOIN category c ON c.id = bc.category_id
        WHERE bc.book_id = b.id
      ) AS "bookCategories"
    FROM book b
    ORDER BY b.${sortField} ${sortOrder}
    LIMIT $1 OFFSET $2`;

    const resultBooks: Book[] = await this.bookRepository.query(
      filter !== '' ? rawQueryUsingFilter : rawQueryWithoutFilter,
      filter !== '' ? [tsquery(filter), limit, offset] : [limit, offset],
    );

    const rawCountQueryUsingFilter: string = `
      SELECT COUNT(*) AS count
      FROM (
        SELECT id
        FROM book
        WHERE to_tsvector('english', coalesce(name, '') || ' ' || coalesce(author, '') || ' ' || coalesce(publisher, ''))
          @@ to_tsquery('english', $1)

        UNION

        SELECT b.id
        FROM book b
        JOIN book_categories bc ON bc.book_id = b.id
        JOIN category c ON c.id = bc.category_id
        WHERE to_tsvector('english', c.name) @@ to_tsquery('english', $1)
      ) AS matching_books;
    `;

    const rawCountQueryWithoutFilter: string = `
      SELECT COUNT(*) AS count
      FROM (
        SELECT b.id
        FROM book b
      ) AS matching_books;`;

    const resultRawCountQuery = await this.bookRepository.query(
      filter !== '' ? rawCountQueryUsingFilter : rawCountQueryWithoutFilter,
      filter !== '' ? [tsquery(filter)] : [],
    );

    const total: number = parseInt(resultRawCountQuery[0].count, 10);

    const data: getAllBooksDTO[] = resultBooks.map(
      (book: Book) => new getAllBooksDTO(book),
    );

    const totalPages: number = Math.ceil(total / limit);

    // category 9s 7 records
    // romance 2s 1.5kk records
    // echoes 260ms 200k records
    // horror 2.55s 1.1kk records

    // new
    // category 580ms
    // romance 3.4s
    // echoes 260ms 200k records
    // horror 2.50s 1.1kk records

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
