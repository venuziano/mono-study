import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookCategory } from './book-categories.entity';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  // @Index('ft_idx_book_name', { fulltext: true })
  @Column({ name: 'name', length: 255 })
  name: string;

  @OneToMany(() => BookCategory, (bookCategory) => bookCategory.book)
  bookCategories: BookCategory[];
}
