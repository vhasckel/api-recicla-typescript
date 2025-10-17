import { Pool, PoolClient, QueryResult } from 'pg';

import { env } from '../config/env';

import { logger } from './logger';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor() {
    this.createPool();
  }

  private createPool(): void {
    const config = env.DATABASE_URL
      ? { connectionString: env.DATABASE_URL }
      : {
          host: env.DB_HOST,
          port: env.DB_PORT,
          database: env.DB_NAME,
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          min: env.DB_POOL_MIN,
          max: env.DB_POOL_MAX,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        };

    this.pool = new Pool(config);

    this.pool.on('error', (err) => {
      logger.error({ err }, 'unexpected error on idle client');
      process.exit(-1);
    });

    this.pool.on('connect', () => {
      if (!this.isConnected) {
        logger.info('database pool created');
      }
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const client = await this.pool!.query('SELECT NOW()');
      this.isConnected = true;
      logger.info({ at: client.rows[0].now }, 'database connected');
    } catch (error) {
      logger.error({ error }, 'database connection failed');
      throw error;
    }
  }

  async query<T extends Record<string, any> = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.query<T>(text, params);
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.connect();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool!.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.pool && this.isConnected) {
      await this.pool.end();
      this.isConnected = false;
      logger.info('database pool closed');
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export const db = new Database();
