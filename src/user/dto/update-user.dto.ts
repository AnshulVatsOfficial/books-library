import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../auth/dto/register-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
