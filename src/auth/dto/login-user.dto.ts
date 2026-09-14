import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
