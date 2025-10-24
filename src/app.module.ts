import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { TypeOrmModule } from './datasource/typeorm.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    RedisModule,
    TypeOrmModule,
    RabbitMQModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
