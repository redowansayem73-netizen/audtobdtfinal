import express from 'express';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import db from './src/db.js'; // Note: using .js extension for ES modules if needed, but tsx handles it. Let's use .ts or just omit extension.

const app = express();
app.use(express.json());

let stripeClient: Stripe | null = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
  }
  return stripeClient;
}

// Authentication
app.post('/api/auth/request-code', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.prepare('INSERT OR REPLACE INTO login_codes (email, code, expires_at) VALUES (?, ?, datetime("now", "+15 minutes"))').run(email, code);
  
  console.log(`\n[LOGIN CODE] For ${email}: ${code}\n`);
  res.json({ success: true, message: 'Code sent (check server console)' });
});

app.post('/api/auth/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = db.prepare('SELECT * FROM login_codes WHERE email = ? AND code = ? AND expires_at > datetime("now")').get(email, code);
  
  if (record) {
    db.prepare('DELETE FROM login_codes WHERE email = ?').run(email);
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
       const info = db.prepare('INSERT INTO users (email) VALUES (?)').run(email);
       user = { id: info.lastInsertRowid, email };
    }
    res.json({ success: true, user });
  } else {
    res.status(400).json({ error: 'Invalid or expired code' });
  }
});

// Transactions
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amountAud, email, name, mobile, deliveryMethod, destinationDetails } = req.body;
    
    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      const info = db.prepare('INSERT INTO users (email, name, mobile) VALUES (?, ?, ?)').run(email, name, mobile);
      user = { id: info.lastInsertRowid, email, name, mobile };
    } else {
      db.prepare('UPDATE users SET name = ?, mobile = ? WHERE id = ?').run(name, mobile, user.id);
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountAud * 100), // in cents
      currency: 'aud',
      metadata: {
        userId: user.id,
        email,
      },
    });

    // Create transaction
    const amountBdt = amountAud * 75.45; // Fixed rate
    const info = db.prepare(`
      INSERT INTO transactions (user_id, amount_aud, amount_bdt, delivery_method, destination_details, payment_intent_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(user.id, amountAud, amountBdt, deliveryMethod, JSON.stringify(destinationDetails), paymentIntent.id);

    res.json({ 
      clientSecret: paymentIntent.client_secret, 
      transactionId: info.lastInsertRowid 
    });
  } catch (error: any) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
      db.prepare('UPDATE transactions SET status = ? WHERE payment_intent_id = ?').run('paid', paymentIntentId);
      res.json({ success: true, status: 'paid' });
    } else {
      res.json({ success: false, status: paymentIntent.status });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin
app.get('/api/admin/transactions', (req, res) => {
  const transactions = db.prepare(`
    SELECT t.*, u.name as user_name, u.email as user_email, u.mobile as user_mobile
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `).all();
  res.json(transactions);
});

app.post('/api/admin/transactions/:id/send', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE transactions SET status = ? WHERE id = ?').run('sent', id);
  
  const tx = db.prepare('SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = ?').get(id) as any;
  console.log(`\n[EMAIL SENT] To: ${tx.email} - Your money has been sent to destination! Details: ${tx.destination_details}\n`);
  
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
