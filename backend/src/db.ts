import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from './db/schema'


const client = postgres({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5433,
    database: process.env.DATABASE_NAME || 'notesync',
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
})

export const db = drizzle(client, {schema})

export async function testConnection() {
    try{
        const result = await client`SELECT version()`;
        console.log('✅ Database connected:', result[0].version);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

export default db;