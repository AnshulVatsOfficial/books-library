import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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
}
