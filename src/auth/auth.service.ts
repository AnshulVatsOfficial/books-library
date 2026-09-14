import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { JwtService } from 'src/jwt/jwt.service';
import { LoginDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerDto: CreateUserDto) {
    const { name, email, password, booksBorrowed } = registerDto;
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      booksBorrowed: booksBorrowed || [],
    });

    return {
      data: { name, email, booksBorrowed: booksBorrowed || [] },
      message: 'User registered successfully.',
      status: HttpStatus.CREATED,
    };
  }

  async loginUser(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const existingUser = await this.userModel.findOne({ email });

    if (!existingUser) {
      throw new NotFoundException(
        "User with this email doesn't already exist.",
      );
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!doesPasswordMatch) {
      throw new BadRequestException('Invalid password.');
    }

    const token = this.jwtService.createJwtToken(String(existingUser._id));

    return {
      data: {
        ...existingUser.toObject(),
        password: undefined,
        token,
      },
      message: 'User logged successfully.',
      status: HttpStatus.OK,
    };
  }
}
