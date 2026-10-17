import type { PaymentMethod } from "../config/constants.js";

export interface SeedCategory {
  name: string;
  color: string;
  icon: string;
  titles: string[];
  range: [number, number];
  methods: PaymentMethod[];
  weight: number;
}

export const seedCategories: SeedCategory[] = [
  {
    name: "Food & Groceries",
    color: "#E89A9A",
    icon: "basket",
    titles: ["Simba Supermarket run", "Market vegetables", "Lunch at campus", "Brunch with friends", "Bread and milk", "Weekly groceries", "Brochettes night"],
    range: [2500, 38000],
    methods: ["mobile_money", "card", "cash"],
    weight: 9,
  },
  {
    name: "Transport",
    color: "#8E9C78",
    icon: "bus",
    titles: ["Moto to campus", "Bus card top up", "Yego cab home", "Moto to town", "Weekend trip to Musanze"],
    range: [500, 9000],
    methods: ["mobile_money", "cash"],
    weight: 8,
  },
  {
    name: "Rent & Housing",
    color: "#B5654A",
    icon: "home",
    titles: ["Monthly rent"],
    range: [180000, 180000],
    methods: ["bank_transfer"],
    weight: 0,
  },
  {
    name: "Utilities",
    color: "#6F7D8C",
    icon: "bolt",
    titles: ["Electricity tokens", "Water bill", "Gas refill"],
    range: [5000, 22000],
    methods: ["mobile_money"],
    weight: 2,
  },
  {
    name: "Airtime & Data",
    color: "#C9A27E",
    icon: "wifi",
    titles: ["Data bundle", "Airtime top up", "Home internet"],
    range: [1000, 30000],
    methods: ["mobile_money"],
    weight: 3,
  },
  {
    name: "Health",
    color: "#A3B18A",
    icon: "heart",
    titles: ["Pharmacy", "Clinic visit", "Vitamins"],
    range: [3000, 25000],
    methods: ["mobile_money", "card"],
    weight: 1,
  },
  {
    name: "Entertainment",
    color: "#D4869C",
    icon: "ticket",
    titles: ["Movie night", "Concert ticket", "Karaoke with the girls", "Board game cafe"],
    range: [3000, 20000],
    methods: ["card", "mobile_money", "cash"],
    weight: 2,
  },
  {
    name: "Shopping",
    color: "#9C6B5E",
    icon: "bag",
    titles: ["Kitenge fabric", "New sneakers", "Tall-fit jeans", "Kitchen things"],
    range: [6000, 55000],
    methods: ["card", "mobile_money"],
    weight: 2,
  },
  {
    name: "Education",
    color: "#7A8B6F",
    icon: "book",
    titles: ["Printing and binding", "Course book", "Online course", "Stationery"],
    range: [1000, 40000],
    methods: ["mobile_money", "card"],
    weight: 1,
  },
  {
    name: "Subscriptions",
    color: "#B48EAE",
    icon: "repeat",
    titles: ["Spotify", "Netflix", "Cloud storage"],
    range: [3500, 12000],
    methods: ["card"],
    weight: 1,
  },
  {
    name: "Personal Care",
    color: "#E3B7A0",
    icon: "sparkles",
    titles: ["Hair appointment", "Skincare restock", "Nails"],
    range: [5000, 30000],
    methods: ["mobile_money", "cash"],
    weight: 1,
  },
  {
    name: "Gifts & Giving",
    color: "#C77D6B",
    icon: "gift",
    titles: ["Sent money to Mum", "Birthday gift", "Church offering", "Wedding contribution"],
    range: [5000, 50000],
    methods: ["mobile_money", "cash"],
    weight: 1,
  },
];

export const seedUsers = [
  "Susan Wambui",
  "John Kamau",
  "Amos Mwangi",
  "Brian Otieno",
  "Grace Wanjiku",
  "Eric Mungai",
  "Diane Wachichi",
  "Samuel Ochieng",
  "Patience Akinyi",
  "Kevin Kibe",
];

export const noteSamples = [
  "Split with my roommate",
  "Worth it honestly",
  "Need to cut back on this one",
  "Paid with the last of the month money",
  "Planned for this",
  "Bought on impulse",
  "Used for a special occasion",
];