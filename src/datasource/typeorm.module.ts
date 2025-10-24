import { DataSource } from "typeorm";
import { Global, Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger()
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: +configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            synchronize: true,
            entities: [`${__dirname}/../**/*.entity.{ts,js}`]
          })
          logger.log(`${__dirname}/../**/**.entity.{.ts,.js}`)
          await dataSource.initialize();
          logger.log("Database connected successfully")
          return dataSource
        } catch (error) {
          logger.error('Error connecting to database')
          throw error;
        }
      },
      inject: [ConfigService],
    }
  ],
  exports: [DataSource]
})
export class TypeOrmModule { }