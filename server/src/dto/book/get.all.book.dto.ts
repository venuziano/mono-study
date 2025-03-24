import { ApiProperty } from '@nestjs/swagger';
import { BookCategory } from 'src/entity/book-categories.entity';
import { Book } from 'src/entity/book.entity';
import { GetBookCategoryDTO } from '../book.categories/book.categories.dto';

export class getAllBooksDTO {
  @ApiProperty({
    description: 'id description',
    example: 'DEP123456 example',
  })
  id: number;

  @ApiProperty({ description: 'name description', example: 'book name 1' })
  name: string;

  @ApiProperty({
    description: 'categories description',
    isArray: true, // optional, but explicit that this is an array
    example: [
      {
        category: {
          id: 1,
          name: 'name-1',
        },
      },
      {
        category: {
          id: 3,
          name: 'name-3',
        },
      },
    ],
  })
  categories: GetBookCategoryDTO[];

  constructor(book: Book) {
    this.id = book.id;
    this.name = book.name;
    this.categories = book.bookCategories.map((bookCategory: BookCategory) => ({
      category: {
        id: bookCategory.category.id,
        name: bookCategory.category.name,
      },
    }));
  }
}
