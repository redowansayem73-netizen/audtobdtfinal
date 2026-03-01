import { mysqlTable, serial, varchar, decimal, timestamp, text, json, mysqlEnum, int, bigint } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  mobile: varchar('mobile', { length: 50 }),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'), // 'user', 'admin', 'super_admin'
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: varchar('value', { length: 2048 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const transfers = mysqlTable('transfers', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number' }),
  amountAud: decimal('amount_aud', { precision: 10, scale: 2 }).notNull(),
  amountBdt: decimal('amount_bdt', { precision: 15, scale: 2 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 4 }).notNull(),
  method: varchar('method', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }), // bkash, nagad, rocket
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountNumber: varchar('account_number', { length: 100 }).notNull(),
  bankName: varchar('bank_name', { length: 255 }),
  branchName: varchar('branch_name', { length: 255 }),
  routingNumber: varchar('routing_number', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'),
  paymentIntentId: varchar('payment_intent_id', { length: 255 }),
  adminTransactionId: varchar('admin_transaction_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const loginCodes = mysqlTable('login_codes', {
  email: varchar('email', { length: 255 }).primaryKey(),
  code: varchar('code', { length: 10 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const beneficiaries = mysqlTable('beneficiaries', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'mobile_wallet', 'bank'
  provider: varchar('provider', { length: 50 }), // bkash, nagad, rocket
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountNumber: varchar('account_number', { length: 100 }).notNull(),
  bankName: varchar('bank_name', { length: 255 }),
  branchName: varchar('branch_name', { length: 255 }),
  routingNumber: varchar('routing_number', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});
