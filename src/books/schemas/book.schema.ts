import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BookCategory } from '../enum/books-category.enum';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true })
export class Book {
  @Prop({
    required: true,
    type: String,
    trim: true,
    unique: true,
  })
  title: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  authorName: string;

  @Prop({
    required: true,
    type: Number,
  })
  price: number;

  @Prop({
    required: true,
    type: String,
    enum: BookCategory,
  })
  category: BookCategory;

  @Prop({
    required: false,
    type: String,
    trim: true,
  })
  coverImageUrl?: string;

  @Prop({
    required: false,
    type: Buffer,
  })
  fileData?: Buffer;

  @Prop({
    required: false,
    type: String,
  })
  fileName?: string;

  @Prop({
    required: false,
    type: String,
  })
  fileType?: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
