import { db } from './src/db/index.js';
import { users, transfers, beneficiaries } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
    const email = 'aarsayem002@gmail.com';
    let [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        await db.insert(users).values({ email, name: 'Hardcore Super Admin', mobile: '01700000000' });
        [user] = await db.select().from(users).where(eq(users.email, email));
    }

    // Insert beneficiaries
    await db.insert(beneficiaries).values([
        { userId: user.id, name: 'John Doe', type: 'mobile_wallet', provider: 'bkash', accountName: 'John Doe Test', accountNumber: '01711111111' },
        { userId: user.id, name: 'Jane Smith', type: 'bank', bankName: 'Islami Bank', branchName: 'Dhaka Main', accountName: 'Jane Smith Test', accountNumber: '20500000000' }
    ]);

    // Insert transfers
    await db.insert(transfers).values([
        { userId: user.id, amountAud: '1000.00', amountBdt: '75450.00', rate: '75.45', method: 'mobile_wallet', provider: 'bkash', accountName: 'John Doe Test', accountNumber: '01711111111', status: 'sent', paymentIntentId: 'pi_dummy1' },
        { userId: user.id, amountAud: '500.00', amountBdt: '37725.00', rate: '75.45', method: 'bank', bankName: 'Islami Bank', accountName: 'Jane Smith Test', accountNumber: '20500000000', status: 'paid', paymentIntentId: 'pi_dummy2' },
        { userId: user.id, amountAud: '250.00', amountBdt: '18862.50', rate: '75.45', method: 'mobile_wallet', provider: 'nagad', accountName: 'Alice Test', accountNumber: '01822222222', status: 'pending', paymentIntentId: 'pi_dummy3' }
    ]);

    console.log('Seeded successfully');
    process.exit(0);
}

seed();
