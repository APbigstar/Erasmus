import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Define a type for SQL query parameters
type SqlParameter = string | number | boolean | null | Buffer | Date;

export async function query<T>(sql: string, params: SqlParameter[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}