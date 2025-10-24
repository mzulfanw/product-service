import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { connect, Channel, ChannelModel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: ChannelModel;
  private channel: Channel;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    try {
      this.connection = await connect({
        hostname: this.configService.get<string>('RABBITMQ_HOST'),
        port: Number(this.configService.get<string>('RABBITMQ_PORT')),
        username: this.configService.get<string>('RABBITMQ_USERNAME'),
        password: this.configService.get<string>('RABBITMQ_PASSWORD'),
      });
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange("event", "topic", { durable: true })
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  async publish(event: string, payload: any) {
    this.channel.publish("events", event, Buffer.from(JSON.stringify(payload)))
  }

  async subscribe(event: string, handler: (msg: any) => void) {
    const q = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(q.queue, 'events', event);
    this.channel.consume(q.queue, (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        handler(data);
        this.channel.ack(msg);
      }
    });
  }
}