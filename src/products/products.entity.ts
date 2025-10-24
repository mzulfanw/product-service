import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  price: number;

  @Column()
  qty: number;

  @CreateDateColumn()
  createdAt: Date;
}