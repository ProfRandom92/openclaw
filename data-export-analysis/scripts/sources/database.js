import mysql from 'mysql2/promise';
import pg from 'pg';

const { Pool: PgPool } = pg;

/**
 * Database Data Source
 * Supports MySQL and PostgreSQL
 */
export class DatabaseSource {
  constructor(config) {
    this.dbType = config.type || 'mysql';
    this.config = config;
  }

  /**
   * Export data from database
   */
  async export(options) {
    const { query, type = this.dbType } = options;

    if (!query) {
      throw new Error('SQL query is required');
    }

    try {
      let data;

      if (type === 'mysql') {
        data = await this.executeMySQL(query);
      } else if (type === 'postgres' || type === 'postgresql') {
        data = await this.executePostgreSQL(query);
      } else {
        throw new Error(`Unsupported database type: ${type}`);
      }

      return {
        success: true,
        data,
        metadata: {
          source: 'database',
          type,
          rowCount: data.length
        }
      };
    } catch (error) {
      throw new Error(`Database export failed: ${error.message}`);
    }
  }

  /**
   * Execute MySQL query
   */
  async executeMySQL(query) {
    const connection = await mysql.createConnection({
      host: this.config.host || process.env.DB_MYSQL_HOST,
      port: this.config.port || process.env.DB_MYSQL_PORT || 3306,
      user: this.config.user || process.env.DB_MYSQL_USER,
      password: this.config.password || process.env.DB_MYSQL_PASSWORD,
      database: this.config.database || process.env.DB_MYSQL_DATABASE
    });

    try {
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      await connection.end();
    }
  }

  /**
   * Execute PostgreSQL query
   */
  async executePostgreSQL(query) {
    const pool = new PgPool({
      host: this.config.host || process.env.DB_POSTGRES_HOST,
      port: this.config.port || process.env.DB_POSTGRES_PORT || 5432,
      user: this.config.user || process.env.DB_POSTGRES_USER,
      password: this.config.password || process.env.DB_POSTGRES_PASSWORD,
      database: this.config.database || process.env.DB_POSTGRES_DATABASE
    });

    try {
      const result = await pool.query(query);
      return result.rows;
    } finally {
      await pool.end();
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      if (this.dbType === 'mysql') {
        const connection = await mysql.createConnection({
          host: this.config.host || process.env.DB_MYSQL_HOST,
          user: this.config.user || process.env.DB_MYSQL_USER,
          password: this.config.password || process.env.DB_MYSQL_PASSWORD
        });
        await connection.end();
      } else {
        const pool = new PgPool({
          host: this.config.host || process.env.DB_POSTGRES_HOST,
          user: this.config.user || process.env.DB_POSTGRES_USER,
          password: this.config.password || process.env.DB_POSTGRES_PASSWORD
        });
        await pool.query('SELECT 1');
        await pool.end();
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }
}
