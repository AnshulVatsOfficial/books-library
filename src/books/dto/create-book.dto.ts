import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BookCategory } from '../enum/books-category.enum';

export class CreateBookDto {
  @ApiProperty({ description: 'Book title', example: 'Clean Code' })
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @ApiProperty({ description: 'Author name', example: 'Robert C. Martin' })
  @IsString({ message: 'Author name must be a string.' })
  @IsNotEmpty({ message: 'Author name is required.' })
  authorName: string;

  @ApiProperty({ description: 'Price of the book', example: 29.99 })
  @IsNumber({}, { message: 'Price must be a number.' })
  @IsNotEmpty({ message: 'Price is required.' })
  price: number;

  @ApiProperty({ enum: BookCategory, description: 'Category of the book' })
  @IsEnum(BookCategory, { message: 'Category must be a valid BookCategory.' })
  @IsNotEmpty({ message: 'Category is required.' })
  category: BookCategory;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
