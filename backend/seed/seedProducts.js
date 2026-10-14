require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const connectDB = require("../config/db");

const seedProducts = [
  // Electronics
  {
    name: "Acoustic Pro Wireless Headphones",
    description: "Premium noise-cancelling over-ear headphones with 40-hour battery life and studio-grade sound clarity.",
    price: 4999,
    category: "Electronics",
    image: "/images/headphones.jpg",
    stock: 25,
  },
  {
    name: "Mechanical Ergonomic Keyboard",
    description: "Hot-swappable mechanical switches, PBT keycaps, and customizable warm amber backlighting.",
    price: 3499,
    category: "Electronics",
    image: "/images/keyboard.jpg",
    stock: 18,
  },
  {
    name: "Minimalist Wireless Desk Charger",
    description: "15W fast inductive charging pad crafted with natural cork and weighted aluminum base.",
    price: 1899,
    category: "Electronics",
    image: "/images/wireless_charger.jpg",
    stock: 40,
  },
  {
    name: "Ultra-Slim Smartwatch Series 5",
    description: "High-definition AMOLED display with comprehensive heart-rate, SPO2, and sleep tracking.",
    price: 5999,
    category: "Electronics",
    image: "/images/smartwatch.jpg",
    stock: 15,
  },

  // Fashion
  {
    name: "Classic Beige Linen Shirt",
    description: "Breathable 100% pure organic linen tailored with relaxed collar and mother-of-pearl buttons.",
    price: 2199,
    category: "Fashion",
    image: "/images/linen_shirt.jpg",
    stock: 30,
  },
  {
    name: "Artisan Leather Everyday Tote",
    description: "Full-grain caramel leather tote bag with reinforced brass hardware and dedicated laptop compartment.",
    price: 3999,
    category: "Fashion",
    image: "/images/leather_tote.jpg",
    stock: 12,
  },
  {
    name: "Merino Wool Knit Sweater",
    description: "Ultra-soft ribbed knit sweater in natural oat cream, perfect for cool evenings.",
    price: 2799,
    category: "Fashion",
    image: "/images/wool_sweater.jpg",
    stock: 22,
  },
  {
    name: "Handcrafted Canvas Weekender",
    description: "Heavyweight organic cotton duck canvas travel duffel with water-resistant wax coating.",
    price: 3299,
    category: "Fashion",
    image: "/images/canvas_weekender.jpg",
    stock: 14,
  },

  // Home
  {
    name: "Handmade Ceramic Coffee Mug Set",
    description: "Set of 2 speckled stoneware mugs with ergonomic handles and gentle beige glaze finish.",
    price: 1199,
    category: "Home",
    image: "/images/ceramic_mugs.jpg",
    stock: 50,
  },
  {
    name: "Nordic Ceramic Ribbed Flower Vase",
    description: "Contemporary decorative earthen vase with matte sandstone texture and curved silhouette.",
    price: 1499,
    category: "Home",
    image: "/images/ceramic_vase.jpg",
    stock: 20,
  },
  {
    name: "Scented Amber Glass Soy Candle",
    description: "Natural non-toxic soy wax infused with sandalwood, vanilla bean, and toasted tonka.",
    price: 899,
    category: "Home",
    image: "/images/amber_candle.jpg",
    stock: 45,
  },
  {
    name: "Woven Jute & Cotton Area Rug",
    description: "Eco-friendly hand-braided floor rug measuring 4x6 ft, blending rustic jute with soft cream cotton.",
    price: 4499,
    category: "Home",
    image: "/images/jute_rug.jpg",
    stock: 8,
  },

  // Books
  {
    name: "The Design of Everyday Things",
    description: "Classic foundational guide to user-centered design and emotional cognitive engineering by Don Norman.",
    price: 699,
    category: "Books",
    image: "/images/everyday_things.jpg",
    stock: 35,
  },
  {
    name: "Clean Code: A Handbook of Agile Craftsmanship",
    description: "Software engineering bible teaching writing readable, maintainable, and robust enterprise code.",
    price: 999,
    category: "Books",
    image: "/images/clean_code.jpg",
    stock: 28,
  },
  {
    name: "Atomic Habits by James Clear",
    description: "Proven framework for improving every day through compounding tiny behavioral improvements.",
    price: 599,
    category: "Books",
    image: "/images/atomic_habits.jpg",
    stock: 60,
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("Seeding products into MongoDB...");
    await Product.deleteMany({});
    const inserted = await Product.insertMany(seedProducts);
    console.log(`Successfully seeded ${inserted.length} products into ShopKart database!`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
