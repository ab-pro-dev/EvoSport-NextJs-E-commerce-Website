import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  const evoBrand = await prisma.brand.create({
    data: {
      name: "EvoSport Lab",
      slug: "evosport-lab",
      logoUrl: "https://placehold.co/150x50/000000/FFFFFF?text=EvoSport",
    },
  });

  const apexBrand = await prisma.brand.create({
    data: {
      name: "Apex Athletics",
      slug: "apex-athletics",
      logoUrl: "https://placehold.co/150x50/000000/FFFFFF?text=Apex",
    },
  });

  const pulseBrand = await prisma.brand.create({
    data: {
      name: "Pulse Performance",
      slug: "pulse-performance",
      logoUrl: "https://placehold.co/150x50/000000/FFFFFF?text=Pulse",
    },
  });

  const shoesCategory = await prisma.category.create({
    data: {
      name: "Running Shoes",
      slug: "running-shoes",
    },
  });

  const apparelCategory = await prisma.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
    },
  });

  const gymCategory = await prisma.category.create({
    data: {
      name: "Gym Gear",
      slug: "gym-gear",
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
    },
  });

  const productsData = [
    {
      name: "EvoRun Pro Carbon Shoes",
      slug: "evorun-pro-carbon-shoes",
      description: "High-performance marathon running shoes with carbon fiber plate and reactive foam cushion.",
      brandId: evoBrand.id,
      categoryId: shoesCategory.id,
      basePrice: 189.99,
      compareAtPrice: 229.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", altText: "EvoRun Pro Main Image", position: 1 },
        { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600", altText: "EvoRun Pro Side View", position: 2 },
      ],
      variants: [
        { sku: "EVO-RUN-BLK-42", color: "Neon Black", size: "US 9 / EU 42", price: 189.99, stock: 15 },
        { sku: "EVO-RUN-BLK-43", color: "Neon Black", size: "US 10 / EU 43", price: 189.99, stock: 20 },
        { sku: "EVO-RUN-CYN-42", color: "Cyber Cyan", size: "US 9 / EU 42", price: 199.99, stock: 10 },
      ],
    },
    {
      name: "Apex HyperStride Runners",
      slug: "apex-hyperstride-runners",
      description: "Lightweight trail and road running shoes engineered for maximum agility and grip.",
      brandId: apexBrand.id,
      categoryId: shoesCategory.id,
      basePrice: 149.99,
      compareAtPrice: 179.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600", altText: "Apex HyperStride", position: 1 },
      ],
      variants: [
        { sku: "APX-STR-RED-41", color: "Crimson Red", size: "US 8 / EU 41", price: 149.99, stock: 8 },
        { sku: "APX-STR-RED-42", color: "Crimson Red", size: "US 9 / EU 42", price: 149.99, stock: 12 },
      ],
    },
    {
      name: "Pulse Aero-Fit Compression Tee",
      slug: "pulse-aero-fit-compression-tee",
      description: "Seamless moisture-wicking compression t-shirt for intense training and recovery.",
      brandId: pulseBrand.id,
      categoryId: apparelCategory.id,
      basePrice: 45.00,
      compareAtPrice: 55.00,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600", altText: "Pulse Compression Tee", position: 1 },
      ],
      variants: [
        { sku: "PLS-TEE-BLK-M", color: "Stealth Black", size: "M", price: 45.00, stock: 25 },
        { sku: "PLS-TEE-BLK-L", color: "Stealth Black", size: "L", price: 45.00, stock: 30 },
      ],
    },
    {
      name: "EvoTech Thermal Training Hoodie",
      slug: "evotech-thermal-training-hoodie",
      description: "Water-resistant thermal fleece hoodie designed for cold weather outdoor training.",
      brandId: evoBrand.id,
      categoryId: apparelCategory.id,
      basePrice: 89.99,
      compareAtPrice: 110.00,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600", altText: "EvoTech Thermal Hoodie", position: 1 },
      ],
      variants: [
        { sku: "EVO-HD-GRY-L", color: "Steel Gray", size: "L", price: 89.99, stock: 14 },
        { sku: "EVO-HD-GRY-XL", color: "Steel Gray", size: "XL", price: 89.99, stock: 10 },
      ],
    },
    {
      name: "Pulse Heavy-Duty Leather Lifting Belt",
      slug: "pulse-heavy-duty-lifting-belt",
      description: "10mm genuine leather powerlifting belt with stainless steel lever buckle.",
      brandId: pulseBrand.id,
      categoryId: gymCategory.id,
      basePrice: 79.99,
      compareAtPrice: 99.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600", altText: "Lifting Belt Front", position: 1 },
      ],
      variants: [
        { sku: "PLS-BLT-BLK-M", color: "Matte Black", size: "M (32-36 in)", price: 79.99, stock: 18 },
        { sku: "PLS-BLT-BLK-L", color: "Matte Black", size: "L (36-40 in)", price: 79.99, stock: 22 },
      ],
    },
    {
      name: "Apex Elite Resistance Bands Set",
      slug: "apex-elite-resistance-bands-set",
      description: "Set of 5 heavy-duty latex resistance bands with handles, door anchor, and ankle straps.",
      brandId: apexBrand.id,
      categoryId: gymCategory.id,
      basePrice: 34.99,
      compareAtPrice: 49.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600", altText: "Apex Resistance Bands", position: 1 },
      ],
      variants: [
        { sku: "APX-BND-SET", color: "Multi-Color", size: "Standard Set", price: 34.99, stock: 50 },
      ],
    },
    {
      name: "EvoHydrate Insulated Stainless Bottle 1L",
      slug: "evohydrate-insulated-stainless-bottle-1l",
      description: "24-hour cold vacuum insulated sports water bottle with leakproof straw cap.",
      brandId: evoBrand.id,
      categoryId: accessoriesCategory.id,
      basePrice: 29.99,
      compareAtPrice: 39.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600", altText: "EvoHydrate Bottle", position: 1 },
      ],
      variants: [
        { sku: "EVO-BTL-BLK-1L", color: "Obsidian Black", size: "1000ml", price: 29.99, stock: 40 },
        { sku: "EVO-BTL-SLV-1L", color: "Brushed Silver", size: "1000ml", price: 29.99, stock: 35 },
      ],
    },
    {
      name: "Apex Performance Hydration Backpack 5L",
      slug: "apex-performance-hydration-backpack-5l",
      description: "Ultra-lightweight running hydration vest with 1.5L water bladder and reflex strips.",
      brandId: apexBrand.id,
      categoryId: accessoriesCategory.id,
      basePrice: 64.99,
      compareAtPrice: 79.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", altText: "Apex Hydration Backpack", position: 1 },
      ],
      variants: [
        { sku: "APX-BP-BLK-5L", color: "Midnight Black", size: "5L Vest", price: 64.99, stock: 16 },
      ],
    },
    {
      name: "EvoGrip Gym Lifting Gloves",
      slug: "evogrip-gym-lifting-gloves",
      description: "Padded palm fitness gloves with wrist wrap support for heavy weightlifting and pull-ups.",
      brandId: evoBrand.id,
      categoryId: accessoriesCategory.id,
      basePrice: 24.99,
      compareAtPrice: 29.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600", altText: "EvoGrip Gym Gloves", position: 1 },
      ],
      variants: [
        { sku: "EVO-GLV-M", color: "Stealth Black", size: "Medium", price: 24.99, stock: 30 },
        { sku: "EVO-GLV-L", color: "Stealth Black", size: "Large", price: 24.99, stock: 25 },
      ],
    },
    {
      name: "Pulse Pro Running Socks 3-Pack",
      slug: "pulse-pro-running-socks-3pack",
      description: "Anti-blister cushioned athletic ankle socks engineered with arch compression.",
      brandId: pulseBrand.id,
      categoryId: accessoriesCategory.id,
      basePrice: 18.99,
      compareAtPrice: 24.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600", altText: "Pulse Socks 3-Pack", position: 1 },
      ],
      variants: [
        { sku: "PLS-SCK-WHT-L", color: "White / Gray", size: "L (US 9-12)", price: 18.99, stock: 45 },
      ],
    },
    {
      name: "Apex Reflective Sports Armband",
      slug: "apex-reflective-sports-armband",
      description: "Water-resistant neoprene phone armband holder with key pocket and high-visibility strips.",
      brandId: apexBrand.id,
      categoryId: accessoriesCategory.id,
      basePrice: 15.99,
      compareAtPrice: 19.99,
      status: ProductStatus.ACTIVE,
      images: [
        { url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600", altText: "Apex Armband", position: 1 },
      ],
      variants: [
        { sku: "APX-ARM-BLK", color: "Reflective Black", size: "Universal", price: 15.99, stock: 60 },
      ],
    },
  ];

  for (const p of productsData) {
    const { images, variants, ...productInfo } = p;
    await prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
    });
  }

  const brandCount = await prisma.brand.count();
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();

  console.log(`✅ Seeded ${brandCount} brands, ${categoryCount} categories, ${productCount} products successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
