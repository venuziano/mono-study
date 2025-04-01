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
    // Calculate the offset using the page number and limit
    const offset = (page - 1) * limit;
    const tsquery = filter.trim().split(/\s+/).join(' & ');

    const allowedSortFields = [
      'name',
      'author',
      'publisher',
      'publication_date',
      'page_count',
      'created_at',
      'updated_at',
    ];

    const sortField: string =
      sort && allowedSortFields.includes(sort) ? sort : 'updated_at';

    const sortOrder: 'ASC' | 'DESC' =
      order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Apply filtering on the book name if provided
    if (filter) {
    }

    // const unionSubQuery = `
    //   SELECT *
    //   FROM book b
    //   WHERE to_tsvector('english', coalesce(b.name, '') || ' ' || coalesce(b.author, '') || ' ' || coalesce(b.publisher, ''))
    //         @@ to_tsquery('english', :tsquery)
    //   UNION
    //   SELECT *
    //   FROM book b
    //   WHERE EXISTS (
    //     SELECT 1
    //     FROM book_categories bc
    //     JOIN category c ON c.id = bc.category_id
    //     WHERE bc.book_id = b.id
    //       AND to_tsvector('english', c.name) @@ to_tsquery('english', :tsquery)
    //   )
    // `;

    // const query3 = this.bookRepository
    //   .createQueryBuilder()
    //   // .select('DISTINCT *')
    //   .select(
    //     'b.id, b.name, b.author, b.publisher, b.publication_date, b.page_count, b.created_at, b.updated_at',
    //   )
    //   .addSelect(
    //     `(SELECT jsonb_agg(jsonb_build_object('category', to_jsonb(c.*)))
    //       FROM book_categories bc
    //       JOIN category c ON c.id = bc.category_id
    //       WHERE bc.book_id = b.id)`,
    //     'bookCategories',
    //   )
    //   .from(`(${unionSubQuery})`, 'b')
    //   .setParameter('tsquery', tsquery)
    //   .groupBy(
    //     'b.id, b.name, b.author, b.publisher, b.publication_date, b.page_count, b.created_at, b.updated_at',
    //   )
    //   .orderBy(`b.${sortField}`, sortOrder)
    //   .skip(offset)
    //   .take(limit);

    // // const books2 = await query3.getRawMany();

    const rawQuery = `
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
    ORDER BY b.${sortField} ${sortOrder};
  `;

    const resulttest = await this.bookRepository.query(rawQuery, [tsquery]);
    // console.log('resulttest', resulttest);

    const rawCountQuery = `
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
    const resultRawCountQuery = await this.bookRepository.query(rawCountQuery, [
      tsquery,
    ]);
    const total: number = parseInt(resultRawCountQuery[0].count, 10);
    // const data = books2.map((book: Book) => new getAllBooksDTO(book));
    const data = resulttest.map((book: Book) => new getAllBooksDTO(book));
    // const data = books2;
    // console.log('books2', books2);
    // Calculate total pages
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
