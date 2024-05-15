import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(@Body() body: CreateNoteDto) {
    return this.notesService.create(body.text);
  }

  @Get()
  async findAll() {
    return this.notesService.findAll();
  }
}
