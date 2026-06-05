import 'dotenv/config';
import { Pool, PoolClient } from 'pg';


const connectionString = process.env.SUPABASE_CONNECTION_STRING
if (!connectionString)
  throw new Error(`Missing required environment variable: ${connectionString}`);

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const newSession = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const closeSession = (client: PoolClient): void => {
  return client.release(true);
};

export const onSession = async <T>(operation: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await newSession();
  try {
    const result = await operation(client);
    return result;
  } catch (error) {
    throw error;
  } finally {
    closeSession(client);
  }
};

export const closePool = async (): Promise<void> => {
  return pool.end();
}

