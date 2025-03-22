import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BookCategory } from './book-categories.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @OneToMany(() => BookCategory, (bookCategory) => bookCategory.category)
  bookCategories: BookCategory[];
}
