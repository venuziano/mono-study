import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookCategory } from './book-categories.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  // @Index('ft_idx_category_name', { fulltext: true })
  @Column({
    name: 'name',
    length: 255,
    // nullable: false,
    // unique: false,
    // default: 'Anonymous',
    // comment: 'book name',
  })
  name: string;

  @OneToMany(() => BookCategory, (bookCategory) => bookCategory.category)
  bookCategories: BookCategory[];
}
