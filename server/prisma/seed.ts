import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  const adminPassword = await bcrypt.hash("Admin123", 12);
  const userPassword = await bcrypt.hash("User123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nuve.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@nuve.com",
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@nuve.com" },
    update: {},
    create: {
      name: "John Customer",
      email: "user@nuve.com",
      role: UserRole.CUSTOMER,
      passwordHash: userPassword,
    },
  });

  const restaurants = [
    {
      name: "Nuve Ember Grill",
      slug: "nuve-ember-grill",
      description:
        "Fire-kissed steaks, herb butters, and premium grilled mains.",
      cuisine: "Steakhouse",
      cuisines: ["Steakhouse", "Grill", "Western"],
      deliveryTime: 35,
      minOrder: 18,
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      menu: [
        [
          "Charcoal Ribeye",
          "Premium cut ribeye with rosemary butter",
          24.5,
          "Mains",
        ],
        [
          "Smoked Chicken Plate",
          "House smoked half chicken with slaw",
          14.9,
          "Mains",
        ],
        [
          "Garlic Truffle Fries",
          "Crispy fries, truffle oil, parmesan",
          6.5,
          "Sides",
        ],
        [
          "Garden Citrus Salad",
          "Mixed greens, citrus dressing, nuts",
          7.2,
          "Salads",
        ],
        [
          "Molten Cocoa Tart",
          "Warm chocolate tart with cream",
          5.9,
          "Desserts",
        ],
      ],
    },
    {
      name: "Nuve Saffron Route",
      slug: "nuve-saffron-route",
      description:
        "Regional Indian signatures with modern plating and balanced spice.",
      cuisine: "Indian",
      cuisines: ["Indian", "North Indian", "Biryani"],
      deliveryTime: 42,
      minOrder: 12,
      image:
        "https://images.unsplash.com/photo-1604908554027-48f3e5f4ef0f?auto=format&fit=crop&w=1200&q=80",
      menu: [
        [
          "Butter Chicken",
          "Creamy tomato gravy, fenugreek, soft chicken",
          12.9,
          "Curries",
        ],
        [
          "Paneer Tikka Masala",
          "Charred paneer in rich masala sauce",
          11.2,
          "Curries",
        ],
        [
          "Lucknowi Biryani",
          "Aromatic basmati with saffron and spices",
          13.8,
          "Rice",
        ],
        [
          "Tandoori Naan Basket",
          "Assorted naan with butter and garlic",
          4.9,
          "Breads",
        ],
        [
          "Kulfi Royale",
          "Pistachio and cardamom frozen dessert",
          4.2,
          "Desserts",
        ],
      ],
    },
    {
      name: "Nuve Pacific Bowl",
      slug: "nuve-pacific-bowl",
      description:
        "Fresh poke bowls, sushi rolls, and light Japanese-inspired favorites.",
      cuisine: "Japanese",
      cuisines: ["Japanese", "Sushi", "Healthy"],
      deliveryTime: 28,
      minOrder: 10,
      image:
        "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80",
      menu: [
        [
          "Salmon Poke Bowl",
          "Marinated salmon, avocado, edamame, rice",
          13.5,
          "Bowls",
        ],
        [
          "Spicy Tuna Roll",
          "Fresh tuna roll with house spicy mayo",
          9.8,
          "Sushi",
        ],
        [
          "Chicken Teriyaki Bowl",
          "Grilled chicken, teriyaki glaze, sesame",
          11.7,
          "Bowls",
        ],
        ["Miso Soup", "Classic miso broth with tofu and seaweed", 3.5, "Sides"],
        [
          "Matcha Cheesecake",
          "Creamy matcha dessert with cookie base",
          5.6,
          "Desserts",
        ],
      ],
    },
  ] as const;

  for (const data of restaurants) {
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        cuisine: data.cuisine,
        cuisines: [...data.cuisines],
        deliveryTime: data.deliveryTime,
        minOrder: data.minOrder,
        image: data.image,
        isVerified: true,
        ownerId: admin.id,
      },
    });

    for (const [name, description, price, category] of data.menu) {
      await prisma.menuItem.create({
        data: {
          name,
          description,
          price,
          category,
          restaurantId: restaurant.id,
          isAvailable: true,
        },
      });
    }
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
