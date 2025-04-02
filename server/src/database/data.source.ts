import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

import { Book } from 'src/entity/book.entity';
import { Category } from 'src/entity/category.entity';
import { BookCategory } from 'src/entity/book.categories.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  // host: process.env.HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [Book, Category, BookCategory],
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
});
