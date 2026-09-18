import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  findUser(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }

  @Post('borrow')
  borrowBook(@Body() { bookId, id }) {
    return this.userService.borrowOneBook(id, bookId);
  }

  @Post('return')
  returnBook(@Body() { id, bookId }) {
    return this.userService.returnOneBook(id, bookId);
  }
}
