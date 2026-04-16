require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  const adminPw = await bcrypt.hash("admin123", 12);
  const userPw = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@rewear.com" },
    update: {},
    create: { email: "admin@rewear.com", password: adminPw, firstName: "Admin", lastName: "ReWear", role: "ADMIN", points: 9999 },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@rewear.com" },
    update: {},
    create: { email: "sarah@rewear.com", password: userPw, firstName: "Sarah", lastName: "Martinez", bio: "Sustainable fashion lover.", location: "Delhi, India", points: 245, rating: 4.9, reviewCount: 12 },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@rewear.com" },
    update: {},
    create: { email: "priya@rewear.com", password: userPw, firstName: "Priya", lastName: "Sharma", location: "Mumbai, India", points: 180 },
  });

  const sampleItems = [
    { title: "Floral Maxi Dress", description: "Beautiful boho-style maxi dress in excellent condition. Worn only twice to events.", brand: "Zara", category: "DRESSES", size: "M", condition: "EXCELLENT", points: 800, images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400"], tags: ["floral", "summer", "boho"], sellerId: sarah.id },
    { title: "Classic Denim Jacket", description: "Timeless Levi's denim jacket. Great for layering. Minor fading adds character.", brand: "Levi's", category: "OUTERWEAR", size: "L", condition: "GOOD", points: 600, images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400"], tags: ["denim", "casual", "jacket"], sellerId: priya.id },
    { title: "Boho Printed Skirt", description: "Flowy printed skirt perfect for festivals. Elastic waistband, fits S-M.", brand: "FabIndia", category: "BOTTOMS", size: "S", condition: "LIKE_NEW", points: 700, images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400"], tags: ["boho", "printed", "skirt"], sellerId: sarah.id },
    { title: "Striped Cotton Shirt", description: "Smart casual striped shirt. Perfect for office or brunch.", brand: "H&M", category: "TOPS", size: "L", condition: "EXCELLENT", points: 500, images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"], tags: ["stripes", "casual", "shirt"], sellerId: priya.id },
    { title: "Ethnic Embroidered Kurta", description: "Gorgeous hand-embroidered kurta from Rajasthan. Pristine condition.", brand: "Craftsvilla", category: "ETHNIC", size: "M", condition: "LIKE_NEW", points: 650, images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400"], tags: ["ethnic", "embroidered", "kurta"], sellerId: sarah.id },
    { title: "Leather Ankle Boots", description: "Brown leather ankle boots. Barely worn, excellent soles remaining.", brand: "Clarks", category: "SHOES", size: "OTHER", condition: "EXCELLENT", points: 750, images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400"], tags: ["boots", "leather", "winter"], sellerId: priya.id },
  ];

  for (const item of sampleItems) {
    await prisma.item.create({ data: item });
  }

  console.log("✅ Seed complete!");
  console.log("Admin: admin@rewear.com / admin123");
  console.log("User:  sarah@rewear.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
