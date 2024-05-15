import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import { Connection, connect, Model } from 'mongoose';
import { Note, NoteSchema } from 'src/schemas/note.schema';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let controller: NotesController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let noteModel: Model<Note>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    noteModel = mongoConnection.model(Note.name, NoteSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        { provide: getModelToken(Note.name), useValue: noteModel },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a note', async () => {
      const note = await controller.create({ text: 'test' });
      expect(note.text).toBe('test');

      const notes = await controller.findAll();
      expect(notes).toHaveLength(1);
      expect(notes[0].text).toBe('test');
    });
  });

  describe('findAll', () => {
    it('should return an empty array', async () => {
      const notes = await controller.findAll();
      expect(notes).toHaveLength(0);
    });

    it('should return an array with one note', async () => {
      await noteModel.create({ text: 'test' });
      await noteModel.create({ text: 'test 2' });

      const notes = await controller.findAll();
      expect(notes).toHaveLength(2);
      expect(notes[0].text).toBe('test');
      expect(notes[1].text).toBe('test 2');
    });

    it('should return an array with one note', async () => {
      await noteModel.create({ text: 'test' });
      await noteModel.create({ text: 'test 2' });

      const notes = await controller.findAll();
      expect(notes.map(({ text }) => ({ text }))).toMatchSnapshot();
    });
  });
});
