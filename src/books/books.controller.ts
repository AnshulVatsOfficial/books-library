import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('books')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new book with binary file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Book uploaded successfully.' })
  @UseInterceptors(FileInterceptor('book'))
  upload(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.booksService.uploadBook(createBookDto, file);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Stream/Download a book file by ID' })
  @ApiResponse({ status: 200, description: 'Streams the book file.' })
  async streamFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.booksService.getBookById(id);

    res.set({
      'Content-Type': file.fileType,
      'Content-Disposition': `inline; filename="${file.fileName}"`,
    });

    res.send(file.fileData);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of books' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Returns paginated books list.' })
  async findBooks(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.booksService.findAllBooks(+page, +limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update book by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Book updated successfully.' })
  @UseInterceptors(FileInterceptor('book'))
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.updateBookById(id, updateBookDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete book by ID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.booksService.removeBookById(id);
  }
}
