import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./products.entity";
import { Repository } from "typeorm";
import Redis from "ioredis";
import { REDIS_CLIENT, REDIS_KEYS } from "../redis/redis.constants";
import { CreateProductDto } from "./dto/create-product.dto";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { OrderCreatedEventDto } from "./dto/order-created-event.dto";

@Injectable()
export class ProductsService implements OnModuleInit {
  private logger = new Logger("Product Service")

  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @Inject(REDIS_CLIENT) private readonly redisService: Redis,
    private readonly rabbitMQService: RabbitMQService
  ) { }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    this.logger.log("Save product")
    const product = this.repo.create(dto);
    const saved = await this.repo.save(product);
    return saved;
  }

  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `${REDIS_KEYS.productId}:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log("Retrieved data in cache")
      return JSON.parse(cached)
    };

    const product = await this.repo.findOne({ where: { id } });
    if (!product) return null
    this.logger.log("Set product to cache")
    await this.redisService.set(cacheKey, JSON.stringify(product))
    return product
  }

  async onModuleInit() {
    await this.rabbitMQService.waitUntilReady();
    await this.rabbitMQService.subscribe("order.created", async (order: OrderCreatedEventDto) => {
      try {
        console.log("📦 Received order.created event:", order);
        const product = await this.repo.findOne({ where: { id: order.productId } });
        if (!product) {
          this.logger.warn(`Product with id ${order.productId} not found`);
          return;
        }
        product.qty = product.qty - (order.qty ?? 1);
        await this.repo.save(product);
        const cacheKey = `${REDIS_KEYS.productId}:${product.id}`;
        await this.redisService.set(cacheKey, JSON.stringify(product));
        this.logger.log(`Product ${product.id} qty updated to ${product.qty}`);
      } catch (error) {
        this.logger.error(`Error processing order.created event: ${error.message}`, error.stack);
      }
    });
  }

}