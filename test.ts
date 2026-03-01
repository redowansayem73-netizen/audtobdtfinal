import { db } from './src/db/index.js';
import { beneficiaries } from './src/db/schema.js';

async function run() {
    const all = await db.select().from(beneficiaries);
    console.log('BENEFICIARIES:', all);
    process.exit(0);
}

run();
