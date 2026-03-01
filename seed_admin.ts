import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
    const email = 'aarsayem002@gmail.com';
    const password = 'JJstmg3xpt9@!'; // In a real app, hash this!

    console.log('Seeding hardcore super admin...');

    const existing = await db.select().from(users).where(eq(users.email, email));

    if (existing.length === 0) {
        await db.insert(users).values({
            email,
            password,
            name: 'Hardcore Super Admin',
            role: 'super_admin'
        });
        console.log('Super admin created successfully.');
    } else {
        await db.update(users)
            .set({ password, role: 'super_admin' })
            .where(eq(users.email, email));
        console.log('Super admin updated successfully.');
    }

    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
