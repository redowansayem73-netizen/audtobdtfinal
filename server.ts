import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { db } from './src/db/index.js';
import { users, transfers, loginCodes, settings, beneficiaries } from './src/db/schema.js';
import { eq, and, gt, gte, lte, or, sql } from 'drizzle-orm';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// Helper to get dynamic stripe secret
async function getStripeKey(keyName: string): Promise<string> {
  const [setting] = await db.select().from(settings).where(eq(settings.key, keyName));
  return setting?.value || process.env[keyName] || '';
}

async function getExchangeRate(): Promise<number> {
  const [setting] = await db.select().from(settings).where(eq(settings.key, 'EXCHANGE_RATE'));
  if (setting && setting.value) {
    return parseFloat(setting.value);
  }
  return 75.45; // default fallback
}

// Mailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"AUD TO BDT" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}

app.get('/api/config/rate', async (req, res) => {
  try {
    const rate = await getExchangeRate();
    res.json({ rate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Auth Helpers for APIs
async function verifyStaff(req: any, res: any) {
  const staffEmail = req.query.staffEmail || req.body.staffEmail;
  console.log(`[AUTH DEBUG] ${req.method} ${req.url} | staffEmail from query: ${req.query.staffEmail} | staffEmail from body: ${req.body.staffEmail}`);
  if (!staffEmail) {
    res.status(401).json({ error: 'Staff authentication required' });
    return null;
  }
  const [staff] = await db.select().from(users).where(eq(users.email, staffEmail as string));
  if (!staff || (staff.role !== 'admin' && staff.role !== 'super_admin')) {
    res.status(403).json({ error: 'Unauthorized access' });
    return null;
  }
  return staff;
}

async function verifySuperAdmin(req: any, res: any) {
  const staff = await verifyStaff(req, res);
  if (!staff) return null;
  if (staff.role !== 'super_admin') {
    res.status(403).json({ error: 'Super Admin access required' });
    return null;
  }
  return staff;
}

// Auth Routes
app.post('/api/auth/request-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(loginCodes).values({
      email,
      code,
      expiresAt,
    }).onDuplicateKeyUpdate({
      set: { code, expiresAt },
    });

    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; padding: 40px 20px; background-color: #f8fafc; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div style="background-color: #0f172a; padding: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">AUD TO BDT</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700;">Secure Login Verification</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">Please use the verification code below to securely log into your account. This code is valid for 15 minutes.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 2px dashed #cbd5e1; margin-bottom: 32px;">
              <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #10b981; margin-left: 12px;">${code}</span>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">If you did not request this code, please securely ignore this email or contact our support team immediately.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} AUD TO BDT Transfer. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail(email, 'Your AUD TO BDT Login Code', html);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const [record] = await db
      .select()
      .from(loginCodes)
      .where(and(eq(loginCodes.email, email), eq(loginCodes.code, code), gt(loginCodes.expiresAt, new Date())));

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Clear code
    await db.delete(loginCodes).where(eq(loginCodes.email, email));

    // Get or create user
    let [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      await db.insert(users).values({ email });
      [user] = await db.select().from(users).where(eq(users.email, email));
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const [user] = await db.select().from(users).where(eq(users.email, email as string));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/user/profile', async (req, res) => {
  try {
    const { currentEmail, name, mobile, address } = req.body;
    if (!currentEmail) return res.status(400).json({ error: 'Current email is required' });

    await db.update(users)
      .set({ name, mobile, address })
      .where(eq(users.email, currentEmail));

    const [updatedUser] = await db.select().from(users).where(eq(users.email, currentEmail));
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || user.password !== password) { // In a real app, hash check here
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer Routes
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amountAud, email, name, mobile, deliveryMethod, destinationDetails } = req.body;

    // Find or create user
    let [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      await db.insert(users).values({ email, name, mobile });
      [user] = await db.select().from(users).where(eq(users.email, email));
    } else {
      await db.update(users).set({ name, mobile }).where(eq(users.id, user.id));
    }

    const secret = await getStripeKey('STRIPE_SECRET_KEY');
    const dynamicStripe = new Stripe(secret, { apiVersion: '2023-10-16' as any });

    const amountCents = Math.round(amountAud * 100);
    const paymentIntent = await dynamicStripe.paymentIntents.create({
      amount: amountCents,
      currency: 'aud',
      metadata: {
        userId: user.id.toString(),
        email,
      },
    });

    const rate = await getExchangeRate();
    const amountBdt = amountAud * rate;

    const transferData: any = {
      userId: user.id,
      amountAud: amountAud.toString(),
      amountBdt: amountBdt.toString(),
      rate: rate.toString(),
      method: deliveryMethod,
      accountName: destinationDetails.accountName,
      accountNumber: destinationDetails.accountNumber,
      paymentIntentId: paymentIntent.id,
      status: 'pending',
    };

    if (deliveryMethod === 'mobile_wallet') {
      transferData.provider = destinationDetails.walletProvider;
    } else {
      transferData.bankName = destinationDetails.bankName;
      transferData.branchName = destinationDetails.branchName;
      transferData.routingNumber = destinationDetails.routingNumber;
    }

    const [result] = await db.insert(transfers).values(transferData);

    const existingBen = await db.select().from(beneficiaries).where(and(
      eq(beneficiaries.userId, user.id),
      eq(beneficiaries.accountNumber, destinationDetails.accountNumber)
    ));

    if (existingBen.length === 0) {
      await db.insert(beneficiaries).values({
        userId: user.id,
        name: destinationDetails.accountName,
        type: deliveryMethod,
        provider: destinationDetails.walletProvider,
        accountName: destinationDetails.accountName,
        accountNumber: destinationDetails.accountNumber,
        bankName: destinationDetails.bankName,
        branchName: destinationDetails.branchName,
        routingNumber: destinationDetails.routingNumber,
      });
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionId: (result as any).insertId,
      user: { id: user.id, email: user.email, name: user.name, mobile: user.mobile }
    });
  } catch (error: any) {
    console.error('Payment Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const secret = await getStripeKey('STRIPE_SECRET_KEY');
    const dynamicStripe = new Stripe(secret, { apiVersion: '2023-10-16' as any });
    const paymentIntent = await dynamicStripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
      await db.update(transfers).set({ status: 'paid' }).where(eq(transfers.paymentIntentId, paymentIntentId));

      const [transfer] = await db.select().from(transfers).where(eq(transfers.paymentIntentId, paymentIntentId));
      const [user] = await db.select().from(users).where(eq(users.id, transfer.userId!));

      if (user && user.email) {
        const receiptHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">Payment Successful</h1>
              <p style="color: #64748b; font-size: 16px;">Your transfer has been secured and is processing.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #64748b; font-weight: bold;">Amount Sent (AUD)</span>
                <span style="font-weight: 900; font-size: 18px;">$${transfer.amountAud}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #64748b; font-weight: bold;">To Receive (BDT)</span>
                <span style="font-weight: 900; font-size: 18px; color: #10b981;">৳${transfer.amountBdt}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #64748b; font-weight: bold;">Recipient Name</span>
                <span style="font-weight: bold;">${transfer.accountName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #64748b; font-weight: bold;">Account / Mobile</span>
                <span style="font-weight: bold;">${transfer.accountNumber}</span>
              </div>
            </div>
            
            <p style="text-align: center; color: #64748b; margin-top: 30px; font-size: 14px;">Log in to your AUD TO BDT Dashboard to track the live progress of your transfer.</p>
          </div>
        `;
        await sendEmail(user.email, 'Transfer Receipt - Payment Successful', receiptHtml);
      }

      res.json({ success: true, status: 'paid' });
    } else {
      res.json({ success: false, status: paymentIntent.status });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Beneficiary Routes
app.get('/api/user/beneficiaries', async (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return res.json([]);

    const userBeneficiaries = await db.select().from(beneficiaries).where(eq(beneficiaries.userId, user.id));
    res.json(userBeneficiaries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/beneficiaries', async (req, res) => {
  try {
    const { email, ...beneficiaryData } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return res.status(404).json({ error: 'User not found' });

    await db.insert(beneficiaries).values({
      userId: user.id,
      ...beneficiaryData
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Routes
app.get('/api/user/transfers', async (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return res.json([]);

    const history = await db.select().from(transfers).where(eq(transfers.userId, user.id)).orderBy(transfers.createdAt);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/transfers', async (req, res) => {
  try {
    const staff = await verifyStaff(req, res);
    if (!staff) return;

    const results = await db
      .select({
        id: transfers.id,
        amountAud: transfers.amountAud,
        amountBdt: transfers.amountBdt,
        status: transfers.status,
        method: transfers.method,
        accountName: transfers.accountName,
        accountNumber: transfers.accountNumber,
        createdAt: transfers.createdAt,
        adminTransactionId: transfers.adminTransactionId,
        paymentIntentId: transfers.paymentIntentId,
        bankName: transfers.bankName,
        branchName: transfers.branchName,
        routingNumber: transfers.routingNumber,
        provider: transfers.provider,
        userEmail: users.email,
        userName: users.name,
        userMobile: users.mobile,
      })
      .from(transfers)
      .innerJoin(users, eq(transfers.userId, users.id))
      .orderBy(transfers.createdAt);

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/transfers/:id', async (req, res) => {
  try {
    const staff = await verifyStaff(req, res);
    if (!staff) return;

    const { id } = req.params;
    const { status, adminTransactionId } = req.body;

    const updateData: any = { status };
    if (adminTransactionId) {
      updateData.adminTransactionId = adminTransactionId;
    }

    await db.update(transfers).set(updateData).where(eq(transfers.id, parseInt(id)));

    if (status === 'sent') {
      const [transfer] = await db.select().from(transfers).where(eq(transfers.id, parseInt(id)));
      const [user] = await db.select().from(users).where(eq(users.id, transfer.userId!));

      if (user && user.email) {
        const deliveryHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #0f172a;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 30px;">✓</div>
              <h1 style="color: #10b981; margin: 0;">Payment Completed</h1>
              <p style="color: #64748b; font-size: 16px;">Your funds have been successfully delivered to the recipient.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <h3 style="margin-top: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Delivery Details</h3>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #64748b;">Transaction ID</span>
                <span style="font-weight: bold; color: #10b981;">#${adminTransactionId || transfer.paymentIntentId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #64748b;">Amount Sent</span>
                <span style="font-weight: bold;">$${transfer.amountAud} AUD</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #64748b;">Amount Delivered</span>
                <span style="font-weight: 900; color: #10b981;">৳${transfer.amountBdt} BDT</span>
              </div>
            </div>

            <div style="background: #f1f5f9; border-radius: 12px; padding: 24px;">
              <h3 style="margin-top: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Recipient Information</h3>
              <p style="margin: 5px 0; font-weight: bold;">${transfer.accountName}</p>
              <p style="margin: 5px 0; color: #64748b;">${transfer.method.replace('_', ' ').toUpperCase()}: ${transfer.accountNumber}</p>
              ${transfer.bankName ? `<p style="margin: 5px 0; color: #64748b;">${transfer.bankName} (${transfer.branchName})</p>` : ''}
            </div>
            
            <p style="text-align: center; color: #64748b; margin-top: 30px; font-size: 14px;">Thank you for choosing AUD TO BDT for your international transfers.</p>
          </div>
        `;
        await sendEmail(user.email, 'Payment Completed - Funds Delivered', deliveryHtml);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/config/rate', async (req, res) => {
  try {
    const staff = await verifyStaff(req, res);
    if (!staff) return;

    const { rate } = req.body;
    if (!rate) return res.status(400).json({ error: 'Rate is required' });

    await db.insert(settings).values({ key: 'EXCHANGE_RATE', value: String(rate) })
      .onDuplicateKeyUpdate({ set: { value: String(rate) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/customers', async (req, res) => {
  try {
    const staff = await verifyStaff(req, res);
    if (!staff) return;

    const allUsers = await db.select().from(users).where(eq(users.role, 'user')).orderBy(users.createdAt);

    const statsQuery = await db.select({
      userId: transfers.userId,
      totalAud: sql<number>`sum(${transfers.amountAud})`,
      count: sql<number>`count(${transfers.id})`
    }).from(transfers).groupBy(transfers.userId);

    const statsMap = new Map();
    statsQuery.forEach((s: any) => statsMap.set(s.userId, s));

    const enrichedUsers = allUsers.map(u => ({
      ...u,
      stats: statsMap.get(u.id) || { totalAud: 0, count: 0 }
    }));

    res.json(enrichedUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/customers/:id', async (req, res) => {
  try {
    const staff = await verifyStaff(req, res);
    if (!staff) return;

    const userId = parseInt(req.params.id);
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const customerTransfers = await db.select().from(transfers).where(eq(transfers.userId, userId)).orderBy(transfers.createdAt);
    const customerBeneficiaries = await db.select().from(beneficiaries).where(eq(beneficiaries.userId, userId));

    res.json({
      ...user,
      transfers: customerTransfers,
      beneficiaries: customerBeneficiaries
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reporting Routes
app.get('/api/admin/reports', async (req, res) => {
  try {
    const staff = await verifyStaff(req, res);
    if (!staff) return;

    const { range = 'all', startDate, endDate } = req.query; // daily, weekly, monthly, yearly, all, custom

    let dateFilter = undefined;
    const now = new Date();
    if (range === 'daily') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = gt(transfers.createdAt, startOfDay);
    } else if (range === 'weekly') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = gt(transfers.createdAt, startOfWeek);
    } else if (range === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = gt(transfers.createdAt, startOfMonth);
    } else if (range === 'yearly') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = gt(transfers.createdAt, startOfYear);
    } else if (range === 'custom') {
      const start = startDate ? new Date(startDate as string) : new Date(0);
      const end = endDate ? new Date(endDate as string) : new Date();
      end.setHours(23, 59, 59, 999);
      dateFilter = and(
        gte(transfers.createdAt, start),
        lte(transfers.createdAt, end)
      );
    }

    let statementQuery = db.select({
      id: transfers.id,
      date: transfers.createdAt,
      accountName: transfers.accountName,
      status: transfers.status,
      amountAud: transfers.amountAud,
      amountBdt: transfers.amountBdt,
      rate: transfers.rate,
      adminTransactionId: transfers.adminTransactionId,
      paymentIntentId: transfers.paymentIntentId,
      senderName: users.name
    }).from(transfers).innerJoin(users, eq(transfers.userId, users.id));

    if (dateFilter) {
      statementQuery = statementQuery.where(dateFilter as any) as any;
    }

    const statements = await statementQuery.orderBy(transfers.createdAt);

    const aggregates = statements.reduce((acc, curr) => {
      if (curr.status === 'paid' || curr.status === 'sent') {
        acc.totalAud += parseFloat(curr.amountAud as string);
        acc.totalBdt += parseFloat(curr.amountBdt as string);
        acc.completedCount += 1;
      }
      acc.count += 1;
      return acc;
    }, { totalAud: 0, totalBdt: 0, count: 0, completedCount: 0 });

    res.json({ aggregates, statement: statements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Super Admin Routes
app.get('/api/super/users', async (req, res) => {
  try {
    const staff = await verifySuperAdmin(req, res);
    if (!staff) return;

    // Only return admins and super_admins
    const results = await db.select()
      .from(users)
      .where(and(
        eq(users.role, 'admin') || eq(users.role, 'super_admin')
      ))
      .orderBy(users.createdAt);

    // Actually, drizzle orm syntax for 'or' is different. Let's fix.
    // Fixed below with imported 'or' if needed, but for now I'll filter manually or use correct d-orm
    const allAdmins = await db.select().from(users).orderBy(users.createdAt);
    res.json(allAdmins.filter(u => u.role === 'admin' || u.role === 'super_admin'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/super/admins', async (req, res) => {
  try {
    const staff = await verifySuperAdmin(req, res);
    if (!staff) return;

    const { email, password, name } = req.body;
    await db.insert(users).values({
      email,
      password,
      name,
      role: 'admin'
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/super/config', async (req, res) => {
  try {
    const staff = await verifySuperAdmin(req, res);
    if (!staff) return;

    const allSettings = await db.select().from(settings);
    res.json(allSettings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/super/config', async (req, res) => {
  try {
    const staff = await verifySuperAdmin(req, res);
    if (!staff) return;

    const { key, value } = req.body;
    await db.insert(settings).values({ key, value })
      .onDuplicateKeyUpdate({ set: { value } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/super/users/:id/role', async (req, res) => {
  try {
    const staff = await verifySuperAdmin(req, res);
    if (!staff) return;

    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await db.update(users).set({ role }).where(eq(users.id, parseInt(id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: 3001
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
