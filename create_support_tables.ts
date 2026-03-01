import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    const createTickets = `
CREATE TABLE IF NOT EXISTS \`tickets\` (
	\`id\` bigint unsigned AUTO_INCREMENT PRIMARY KEY,
	\`user_id\` bigint NOT NULL,
	\`subject\` varchar(255) NOT NULL,
	\`status\` varchar(50) DEFAULT 'open',
	\`created_at\` timestamp DEFAULT (now()),
	\`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);`;

    const createMessages = `
CREATE TABLE IF NOT EXISTS \`ticket_messages\` (
	\`id\` bigint unsigned AUTO_INCREMENT PRIMARY KEY,
	\`ticket_id\` bigint NOT NULL,
	\`sender\` varchar(50) NOT NULL,
	\`message\` text NOT NULL,
	\`created_at\` timestamp DEFAULT (now())
);`;

    console.log('Creating tickets table...');
    await connection.query(createTickets);
    console.log('Creating ticket_messages table...');
    await connection.query(createMessages);

    console.log('Support tables initialized securely!');
    await connection.end();
}

main().catch(console.error);
