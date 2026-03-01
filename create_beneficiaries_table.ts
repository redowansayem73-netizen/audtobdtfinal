import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Creating beneficiaries table...');
    try {
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        provider VARCHAR(50),
        account_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        bank_name VARCHAR(255),
        branch_name VARCHAR(255),
        routing_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Table created successfully!');
    } catch (error) {
        console.error('Error creating table:', error);
    }
    process.exit();
}

main();
