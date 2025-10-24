import { Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import { ProductsService } from './products.service';
import { CreateProductDto } from "./dto/create-product.dto";

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found')
    }
    return product
  }
}