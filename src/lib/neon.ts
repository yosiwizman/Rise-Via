import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const sql = neon(databaseUrl);

export const dbHelpers = {
  async findOne(tableName: string, conditions: Record<string, any>) {
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    const result = await sql`SELECT * FROM ${sql.unsafe(tableName)} WHERE ${sql.unsafe(whereClause)}`;
    return result[0] || null;
  },
  
  async findMany(tableName: string, conditions: Record<string, any> = {}) {
    if (Object.keys(conditions).length === 0) {
      return await sql`SELECT * FROM ${sql.unsafe(tableName)}`;
    }
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    return await sql`SELECT * FROM ${sql.unsafe(tableName)} WHERE ${sql.unsafe(whereClause)}`;
  },
  
  async insertOne(tableName: string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const result = await sql`INSERT INTO ${sql.unsafe(tableName)} (${sql.unsafe(keys.join(', '))}) VALUES (${sql.unsafe(placeholders)}) RETURNING *`;
    return result[0];
  }
};
