import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { connect, Channel, ChannelModel } from "amqplib";

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection!: ChannelModel;
  private channel!: Channel;
  private readonly exchangeName = "events";
  private ready!: Promise<void>;
  private readyResolve!: () => void;
  private logger = new Logger("RabbitMQ")

  constructor(private readonly configService: ConfigService) {
    this.ready = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
  }

  async onModuleInit() {
    await this.connectRabbitMQ();
  }

  private async connectRabbitMQ() {
    this.logger.log("🐇 Connecting to RabbitMQ...");

    this.connection = await connect({
      hostname: this.configService.get<string>("RABBITMQ_HOST"),
      port: Number(this.configService.get<string>("RABBITMQ_PORT")),
      username: this.configService.get<string>("RABBITMQ_USERNAME"),
      password: this.configService.get<string>("RABBITMQ_PASSWORD"),
    });

    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchangeName, "topic", { durable: true });

    this.logger.log("✅ RabbitMQ connected and exchange asserted.");

    this.readyResolve();
  }

  async waitUntilReady() {
    return this.ready;
  }

  async publish(event: string, payload: any) {
    if (!this.channel) throw new Error("RabbitMQ channel not initialized");
    this.channel.publish(this.exchangeName, event, Buffer.from(JSON.stringify(payload)));
    this.logger.log(`📤 Published event: ${event}`);
  }

  async subscribe(event: string, handler: (msg: any) => void) {
    if (!this.channel) throw new Error("RabbitMQ channel not initialized");
    const q = await this.channel.assertQueue("", { exclusive: true });
    await this.channel.bindQueue(q.queue, this.exchangeName, event);
    this.channel.consume(q.queue, (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        handler(data);
        this.channel.ack(msg);
      }
    });
  }
}