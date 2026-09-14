import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {}

  async uploadBook(createBookDto: CreateBookDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please upload a file.');
    }

    const existingBook = await this.bookModel.findOne({
      title: createBookDto.title,
    });

    if (existingBook) {
      throw new ConflictException('Book with similar title already exists.');
    }

    const book = await this.bookModel.create({
      ...createBookDto,
      fileData: file.buffer,
      fileName: file.originalname,
      fileType: file.mimetype,
    });

    const bookObject = book.toObject();
    delete bookObject.fileData;

    return {
      data: {
        ...bookObject,
        fileUrl: `/books/${book._id}/file`,
      },
      message: 'Book uploaded successfully.',
      status: HttpStatus.CREATED,
    };
  }

  async getBookById(id: string) {
    const book = await this.bookModel.findById(id);

    if (!book || !book.fileData) {
      throw new NotFoundException('Book file not found.');
    }

    return {
      fileData: book.fileData,
      fileName: book.fileName || 'book.pdf',
      fileType: book.fileType || 'application/pdf',
    };
  }

  async findAllBooks(page: number = 1, limit: number = 10) {
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const booksToSkip = (pageNumber - 1) * limitNumber;

    const [books, totalBooks] = await Promise.all([
      this.bookModel.find().skip(booksToSkip).limit(limitNumber),
      this.bookModel.estimatedDocumentCount(),
    ]);

    if (Array.isArray(books) && books.length === 0) {
      throw new NotFoundException('No books found.');
    }

    const allBooks = books.map((book) => {
      const bookObject = book.toObject();
      delete bookObject.fileData;
      return {
        ...bookObject,
        fileUrl: `/books/${book._id}/file`,
      };
    });

    return {
      data: allBooks,
      meta: {
        totalBooks,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalBooks / limitNumber),
      },
      message: 'Books fetched successfully.',
      status: HttpStatus.OK,
    };
  }

  async updateBookById(
    id: string,
    updateBookDto: UpdateBookDto,
    file?: Express.Multer.File,
  ) {
    const updateData: Record<string, any> = { ...updateBookDto };

    if (file) {
      updateData.fileData = file.buffer;
      updateData.fileName = file.originalname;
      updateData.fileType = file.mimetype;
    }

    const book = await this.bookModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    const updatedBook = book.toObject();
    delete updatedBook.fileData;

    return {
      data: {
        ...updatedBook,
        fileUrl: `/books/${book._id}/file`,
      },
      message: 'Book updated successfully.',
      status: HttpStatus.OK,
    };
  }

  async removeBookById(id: string) {
    const doesBookExist = await this.bookModel.findById({ _id: id });

    if (!doesBookExist) {
      throw new NotFoundException('Book not found.');
    }

    await this.bookModel.findByIdAndDelete(id);

    return {
      message: 'Book deleted successfully.',
      status: HttpStatus.OK,
    };
  }
}
