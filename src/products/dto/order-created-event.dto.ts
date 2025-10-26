import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class OrderCreatedEventDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  quantity: number;

  @IsString()
  status: string;

  @IsString()
  createdAt: string;
}