import { Test, TestingModule } from '@nestjs/testing';
import { SuperController } from './super.controller';
import { AppModule } from '../app.module';

describe('SuperController', () => {
  let controller: SuperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperController],
    }).compile();
    controller = module.get<SuperController>(SuperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
