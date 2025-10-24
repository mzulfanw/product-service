

# Product Service

Product Service is a backend application built with NestJS, providing product management features, Redis integration for caching, RabbitMQ for messaging, and PostgreSQL with TypeORM for database operations.

## Architecture Overview

This project follows a modular and layered architecture:

- **NestJS Modules**: Each feature is encapsulated in its own module (`products`, `redis`, `rabbitmq`, `datasource`).
- **Database Layer**: Uses TypeORM to interact with PostgreSQL. Product entities use UUID as primary keys.
- **Caching Layer**: Redis is used to cache product data for fast retrieval and reduced database load.
- **Messaging Layer**: RabbitMQ integration enables asynchronous communication and event-driven patterns.
- **Validation Layer**: Input validation is handled globally using class-validator and ValidationPipe.
- **Configuration**: All environment variables are managed via `.env` and injected using NestJS `ConfigModule`.

## Main Features
- CRUD Product (UUID-based)
- Redis caching for product data
- RabbitMQ integration for messaging
- Input validation with class-validator
- TypeORM + PostgreSQL integration

## Installation
```bash
npm install
```

## Environment Configuration
```
cp .env .env.example
```

## Running the Application
```bash
npm run start:dev
```

## Docker
Build and run the container:
```bash
docker build -t product-service .
docker run -p 3002:3002 --env-file .env product-service
```

The service will be available on port 3002.

## Main Endpoints
- `POST /products` : Create product (with validation)
- `GET /products/:id` : Get product by UUID (with Redis cache)

## Testing
```bash
npm run test
npm run test:e2e
```

## Folder Structure
- `src/products` : Product module
- `src/redis` : Redis module
- `src/rabbitmq` : RabbitMQ module
- `src/datasource` : TypeORM module
