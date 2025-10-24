import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./products.entity";
import { RedisModule } from "src/redis/redis.module";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    RedisModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule { }
