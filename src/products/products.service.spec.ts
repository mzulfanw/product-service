import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreateProductDto } from './dto/create-product.dto';

const repoCreateMock = jest.fn();
const repoSaveMock = jest.fn();
const repoFindOneMock = jest.fn();
const mockProductRepository = {
  create: repoCreateMock,
  save: repoSaveMock,
  findOne: repoFindOneMock,
};

const redisGetMock = jest.fn();
const redisSetMock = jest.fn();
const mockRedisService = {
  get: redisGetMock,
  set: redisSetMock,
};

const rabbitWaitUntilReadyMock = jest.fn();
const rabbitSubscribeMock = jest.fn();
const mockRabbitMQService = {
  waitUntilReady: rabbitWaitUntilReadyMock,
  subscribe: rabbitSubscribeMock,
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: Repository<Product>;
  let redisService: Redis;
  let rabbitMQService: RabbitMQService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepository as any },
        { provide: 'REDIS_CLIENT', useValue: mockRedisService as any },
        { provide: RabbitMQService, useValue: mockRabbitMQService as any },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = mockProductRepository as any;
    redisService = mockRedisService as any;
    rabbitMQService = mockRabbitMQService as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create and save a product', async () => {
      const dto: CreateProductDto = { name: 'Test', qty: 10 } as any;
      const product = { ...dto } as Product;
      repoCreateMock.mockReturnValue(product);
      repoSaveMock.mockResolvedValue(product);
      const result = await service.createProduct(dto);
      expect(repoCreateMock).toHaveBeenCalledWith(dto);
      expect(repoSaveMock).toHaveBeenCalledWith(product);
      expect(result).toEqual(product);
    });
  });

  describe('getProductById', () => {
    it('should return product from cache if exists', async () => {
      const product = { id: '1', name: 'Test', qty: 10 };
      redisGetMock.mockResolvedValue(JSON.stringify(product));
      const result = await service.getProductById('1');
      expect(redisGetMock).toHaveBeenCalled();
      expect(result).toEqual(product);
    });

    it('should return product from db and set cache if not cached', async () => {
      redisGetMock.mockResolvedValue(null);
      const product = { id: '2', name: 'Test2', qty: 5 } as Product;
      repoFindOneMock.mockResolvedValue(product);
      redisSetMock.mockResolvedValue('OK');
      const result = await service.getProductById('2');
      expect(repoFindOneMock).toHaveBeenCalledWith({ where: { id: '2' } });
      expect(redisSetMock).toHaveBeenCalledWith(expect.any(String), JSON.stringify(product));
      expect(result).toEqual(product);
    });

    it('should return null if product not found', async () => {
      redisGetMock.mockResolvedValue(null);
      repoFindOneMock.mockResolvedValue(null);
      const result = await service.getProductById('3');
      expect(result).toBeNull();
    });
  });
});
