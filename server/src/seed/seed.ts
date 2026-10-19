import { Types } from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Category, slugify } from "../models/Category.js";
import { Expense } from "../models/Expense.js";
import { Budget } from "../models/Budget.js";
import { SavingsGoal } from "../models/SavingsGoal.js";
import { ensureDefaultCategory } from "../services/categoryService.js";
import { currentMonthKey, daysInMonth, previousMonthKey } from "../utils/dates.js";
import { noteSamples, seedCategories, seedUsers, type SeedCategory } from "./data.js";

function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = createRandom(20261017);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function between(min: number, max: number, step = 500): number {
  if (min === max) return min;
  const raw = min + random() * (max - min);
  return Math.max(step, Math.round(raw / step) * step);
}

function weightedCategory(categories: SeedCategory[]): SeedCategory {
  const pool = categories.filter((category) => category.weight > 0);
  const totalWeight = pool.reduce((sum, category) => sum + category.weight, 0);
  let roll = random() * totalWeight;
  for (const category of pool) {
    roll -= category.weight;
    if (roll <= 0) return category;
  }
  return pool[pool.length - 1];
}

interface ExpenseDraft {
  user: Types.ObjectId;
  title: string;
  amount: number;
  category: Types.ObjectId;
  date: Date;
  paymentMethod: SeedCategory["methods"][number];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

function monthKeys(count: number): string[] {
  const keys: string[] = [];
  let cursor = currentMonthKey();
  for (let index = 0; index < count; index += 1) {
    keys.unshift(cursor);
    cursor = previousMonthKey(cursor);
  }
  return keys;
}

function buildMonthExpenses(
  userId: Types.ObjectId,
  month: string,
  targetSpend: number,
  categoryIds: Map<string, Types.ObjectId>,
  includeRent: boolean,
  scaleToToday = true,
): ExpenseDraft[] {
  const [year, monthIndex] = month.split("-").map(Number);
  const today = new Date();
  const isCurrent = month === currentMonthKey();
  const lastDay = isCurrent ? today.getUTCDate() : daysInMonth(month);
  const drafts: ExpenseDraft[] = [];
  let spent = 0;

  const push = (category: SeedCategory, title: string, amount: number, day: number) => {
    const date = new Date(Date.UTC(year, monthIndex - 1, day, 8 + Math.floor(random() * 12), Math.floor(random() * 60)));
    drafts.push({
      user: userId,
      title,
      amount,
      category: categoryIds.get(category.name) as Types.ObjectId,
      date,
      paymentMethod: pick(category.methods),
      notes: pick(noteSamples),
      createdAt: date,
      updatedAt: date,
    });
    spent += amount;
  };

  if (includeRent) {
    const rent = seedCategories.find((category) => category.name === "Rent & Housing");
    if (rent) push(rent, "Monthly rent", rent.range[0], 1);
  }

  const subscriptions = seedCategories.find((category) => category.name === "Subscriptions");
  if (subscriptions && lastDay >= 5) push(subscriptions, "Spotify", 4500, 5);

  const scaledTarget = isCurrent && scaleToToday ? targetSpend * (lastDay / daysInMonth(month)) : targetSpend;
  let guard = 0;
  while (spent < scaledTarget && guard < 120) {
    const category = weightedCategory(seedCategories);
    push(category, pick(category.titles), between(category.range[0], category.range[1]), 1 + Math.floor(random() * lastDay));
    guard += 1;
  }

  return drafts;
}

   function daysAgo(days: number): Date {
     return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
   }

   function monthsAhead(months: number): Date {
     const date = new Date();
     date.setMonth(date.getMonth() + months, 15);
     date.setHours(12, 0, 0, 0);
     return date;
   }

   function buildSavingsGoals(user: Types.ObjectId) {
     return [
       {
         user,
         name: "Emergency fund",
         targetAmount: 600000,
         targetDate: monthsAhead(8),
         color: "#8E9C78",
         contributions: [
           { amount: 50000, note: "Starting amount", date: daysAgo(150) },
           { amount: 40000, note: "From May allowance", date: daysAgo(120) },
           { amount: 45000, note: "Side gig money", date: daysAgo(90) },
           { amount: 40000, note: "", date: daysAgo(60) },
           { amount: -15000, note: "Clinic visit", date: daysAgo(45) },
           { amount: 50000, note: "", date: daysAgo(25) },
           { amount: 35000, note: "October top up", date: daysAgo(4) },
         ],
       },
       {
         user,
         name: "New laptop",
         targetAmount: 900000,
         targetDate: monthsAhead(5),
         color: "#B48EAE",
         contributions: [
           { amount: 100000, note: "Starting amount", date: daysAgo(100) },
           { amount: 80000, note: "", date: daysAgo(70) },
           { amount: 60000, note: "Birthday money", date: daysAgo(40) },
           { amount: 75000, note: "", date: daysAgo(10) },
         ],
       },
       {
         user,
         name: "Trip to Zanzibar",
         targetAmount: 450000,
         targetDate: monthsAhead(14),
         color: "#E89A9A",
         contributions: [{ amount: 30000, note: "Starting amount", date: daysAgo(20) }],
       },
       {
         user,
         name: "Phone repair",
         targetAmount: 120000,
         targetDate: null,
         color: "#C9A27E",
         contributions: [
           { amount: 60000, note: "Starting amount", date: daysAgo(80) },
           { amount: 60000, note: "Done", date: daysAgo(50) },
         ],
       },
     ];
   }

async function seed() {
  await connectDatabase();
  console.log("Clearing existing data...");
       await Promise.all([
       User.deleteMany({}),
       Category.deleteMany({}),
       Expense.deleteMany({}),
       Budget.deleteMany({}),
       SavingsGoal.deleteMany({}),
     ]);

  await ensureDefaultCategory();
  const categories = await Category.insertMany(
    seedCategories.map((category) => ({
      name: category.name,
      slug: slugify(category.name),
      color: category.color,
      icon: category.icon,
    })),
  );
  const categoryIds = new Map(categories.map((category) => [category.name, category._id]));
  console.log(`Created ${categories.length + 1} categories`);

  const admin = await User.create({
    name: "Retain Admin",
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: "admin",
    termsAcceptedAt: new Date(),
  });
  await Category.updateMany({}, { $set: { createdBy: admin._id } });

  const demo = await User.create({
    name: "Irene Winnie",
    email: env.SEED_DEMO_EMAIL,
    password: env.SEED_DEMO_PASSWORD,
    role: "user",
    termsAcceptedAt: new Date(),
  });

  const months = monthKeys(6);
  const now = Date.now();
  const others = [];
  for (const [index, name] of seedUsers.entries()) {
    const joined = new Date(now - (index + 1) * 9 * 24 * 60 * 60 * 1000);
    others.push({
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      password: "Password@2026",
      role: "user" as const,
      termsAcceptedAt: joined,
      createdAt: joined,
      updatedAt: joined,
    });
  }
  const otherUsers = [];
  for (const draft of others) {
    const created = new User(draft);
    await created.save({ timestamps: false });
    otherUsers.push(created);
  }

  const demoBudgets = [520000, 500000, 480000, 500000, 460000, 450000];
  const demoTargets = [470000, 535000, 455000, 430000, 498000, 385000];
  const expenses: ExpenseDraft[] = [];
  const budgets: { user: Types.ObjectId; month: string; amount: number }[] = [];

  months.forEach((month, index) => {
    budgets.push({ user: demo._id, month, amount: demoBudgets[index] });
    expenses.push(...buildMonthExpenses(demo._id, month, demoTargets[index], categoryIds, true, false));
  });

  for (const user of otherUsers) {
    const activeMonths = months.slice(-1 - Math.floor(random() * 3));
    for (const month of activeMonths) {
      const target = between(60000, 260000, 1000);
      budgets.push({ user: user._id, month, amount: between(150000, 320000, 10000) });
      expenses.push(...buildMonthExpenses(user._id, month, target, categoryIds, random() > 0.5));
    }
  }

  await Budget.insertMany(budgets);
  await SavingsGoal.insertMany(buildSavingsGoals(demo._id));
  await Expense.insertMany(expenses, { ordered: false });

  console.log(`Created ${otherUsers.length + 2} users, ${budgets.length} budgets and ${expenses.length} expenses`);
  console.log(`Admin login: ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
  console.log(`Demo login:  ${env.SEED_DEMO_EMAIL} / ${env.SEED_DEMO_PASSWORD}`);
}

seed()
  .catch((error: unknown) => {
    console.error("Seeding failed", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void disconnectDatabase();
  });