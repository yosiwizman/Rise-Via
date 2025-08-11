import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.DATABASE_URL || 'postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder?sslmode=require';

export const sql = neon(databaseUrl);

export const supabase = {
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => sql`SELECT ${columns} FROM ${table} WHERE ${column} = ${value}`,
      order: (column: string, options: any) => sql`SELECT ${columns} FROM ${table} ORDER BY ${column} ${options.ascending ? 'ASC' : 'DESC'}`
    }),
    insert: (data: any) => ({
      select: () => sql`INSERT INTO ${table} (${Object.keys(data).join(', ')}) VALUES (${Object.values(data).map(() => '?').join(', ')}) RETURNING *`
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => sql`UPDATE ${table} SET ${Object.keys(data).map(key => `${key} = ?`).join(', ')} WHERE ${column} = ${value} RETURNING *`
    })
  })
};

export const supabaseAdmin = null; // Not needed with Neon
