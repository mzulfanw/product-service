import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 1000000 })
  price: number;

  @Column()
  qty: number;

  @CreateDateColumn()
  createdAt: Date;
}