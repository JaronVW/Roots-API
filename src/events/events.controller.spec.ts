import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [EventsService],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    let findAllService;

    beforeEach(() => {
      findAllService = jest.spyOn(eventsService, 'findAll');
    });

    it('should return an array of events', async () => {
      const result = await controller.findAll(new EventQueryParamsDto());
      expect(result).toBeInstanceOf(Array);
    });
  });
});
