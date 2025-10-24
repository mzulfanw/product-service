import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./products.entity";
import { Repository } from "typeorm";
import Redis from "ioredis";
import { REDIS_CLIENT, REDIS_KEYS } from "src/redis/redis.constants";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService {
  private logger = new Logger("Product Service")

  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @Inject(REDIS_CLIENT) private readonly redisService: Redis
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
}