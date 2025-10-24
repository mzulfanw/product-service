import { Module } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT') || '6379'),
          showFriendlyErrorStack: true
        });
      },
      inject: [ConfigService]
    },
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule { }