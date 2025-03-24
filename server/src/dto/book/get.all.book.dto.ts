import { ApiProperty } from '@nestjs/swagger';
import { BookCategory } from 'src/entity/book-categories.entity';
import { Book } from 'src/entity/book.entity';

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
    example: [{ name: 'category 1' }, { name: 'category 1' }],
  })
  categories: BookCategory[];

  constructor(book: Book) {
    this.id = book.id;
    this.name = book.name;
    this.categories = book.bookCategories;
  }
}
