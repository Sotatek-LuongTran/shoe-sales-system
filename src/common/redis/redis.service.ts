import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST') ?? 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') ?? 6379;

    this.client = new Redis({
      host,
      port,
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds && ttlSeconds > 0) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }
  async setWithNumber(
    key: string,
    value: number,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds && ttlSeconds > 0) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async getAsNumber(key: string): Promise<number | null> {
    const value = await this.client.get(key);
    if (value === null) {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
