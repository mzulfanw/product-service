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
        const result = await this.repo.createQueryBuilder()
          .update(Product)
          .set({ qty: () => `qty - ${order.quantity ?? 1}` })
          .where("id = :id AND qty >= :qty", { id: order.productId, qty: order.quantity ?? 1 })
          .execute();
        if (result.affected === 0) {
          this.logger.warn(`Product ${order.productId} insufficient stock for order (qty=${order.quantity ?? 1})`);
          return;
        }
        let updatedProduct = result.raw[0];
        if (!updatedProduct) {
          updatedProduct = await this.repo.findOne({ where: { id: order.productId } });
        }
        const cacheKey = `${REDIS_KEYS.productId}:${updatedProduct.id}`;
        await this.redisService.set(cacheKey, JSON.stringify({ ...updatedProduct }));
        this.logger.log(`Product ${updatedProduct.id} qty updated to ${updatedProduct.qty}`);
      } catch (error) {
        this.logger.error(`Error processing order.created event: ${error.message}`, error.stack);
      }
    });
  }

}