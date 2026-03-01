import 'dotenv/config';
import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
    try {
        console.log('Adding address column to users table...');
        await db.execute(sql`ALTER TABLE users ADD COLUMN address TEXT AFTER role`);
        console.log('Migration successful!');
        process.exit(0);
    } catch (err: any) {
        if (err.message.includes('Duplicate column name')) {
            console.log('Column already exists.');
            process.exit(0);
        }
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
