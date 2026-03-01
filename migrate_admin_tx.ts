import 'dotenv/config';
import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
    try {
        console.log('Adding admin_transaction_id column to transfers table...');
        await db.execute(sql`ALTER TABLE transfers ADD COLUMN admin_transaction_id VARCHAR(255) AFTER payment_intent_id`);
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
