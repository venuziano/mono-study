import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BookCategory } from './book-categories.entity';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @OneToMany(() => BookCategory, (bookCategory) => bookCategory.book)
  bookCategories: BookCategory[];
}
