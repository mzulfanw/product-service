import { Body, Controller, Get, NotFoundException, Param, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { ProductsService } from './products.service';
import { CreateProductDto } from "./dto/create-product.dto";

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.createProduct(dto);
    return {
      success: true,
      message: 'Product created successfully',
      data: product
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      success: true,
      message: 'Product retrieved successfully',
      data: product
    };
  }
}