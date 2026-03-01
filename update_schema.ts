import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    console.log('Adding password column to users table...');
    try {
        await connection.execute('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER mobile');
        console.log('Column added successfully.');
    } catch (err: any) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            throw err;
        }
    } finally {
        await connection.end();
    }
}

updateSchema().catch(console.error);
