import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { Book, BookDocument } from 'src/books/schemas/book.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {}

  async findUserById(id: string): Promise<any> {
    const user = await this.userModel.findById({ _id: id });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      data: { ...user.toObject(), password: undefined },
      message: 'User retrieved successfully.',
      status: HttpStatus.OK,
    };
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException("User doesn't exist.");
    }

    return {
      data: { ...updatedUser.toObject(), password: undefined },
      message: 'User updated successfully.',
      status: HttpStatus.OK,
    };
  }

  async deleteUserById(id: string) {
    const user = await this.userModel.findById({ _id: id });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.userModel.findOneAndDelete({ _id: id });

    return {
      message: 'User deleted successfully.',
      status: HttpStatus.OK,
    };
  }

  async borrowOneBook(id: string, bookId: string) {
    const doesBookExist = await this.bookModel.findById({ _id: bookId });

    if (!doesBookExist) {
      throw new NotFoundException("Book doesn't exist.");
    }

    const user = await this.userModel.findByIdAndUpdate(
      { _id: id },
      { $addToSet: { booksBorrowed: bookId } },
      { new: true },
    );

    return {
      data: { ...user.toObject() },
      message: 'Book borrowed succesfully.',
      status: HttpStatus.OK,
    };
  }

  async returnOneBook(id: string, bookId: string) {
    const doesBookExist = await this.bookModel.findById({ _id: bookId });

    if (!doesBookExist) {
      throw new NotFoundException("Book doesn't exist.");
    }

    const user = await this.userModel.findById({ _id: id });

    if (!user) {
      throw new NotFoundException("User doesn't exist.");
    }

    const { booksBorrowed } = user;

    if (!booksBorrowed.includes(bookId)) {
      throw new ConflictException(
        'This book is not in your borrowed list or has already been returned',
      );
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $pull: { booksBorrowed: bookId } },
      { new: true },
    );

    return {
      data: { ...updatedUser.toObject() },
      message: 'Book returned successfully.',
      status: HttpStatus.OK,
    };
  }
}
