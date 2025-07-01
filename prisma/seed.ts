import { PrismaClient, User } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
prisma.$connect();

async function createUsers(count = 5) {
  console.log("👤 Creating users...");
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const user = await prisma.user.create({
      data: {
        email: i === 0 ? "test@example.com" : faker.internet.email(),
        name: faker.person.fullName(),
      },
    });
    users.push(user);
  }

  return users;
}

async function createTasksForUsers(users: any[]) {
  console.log("📝 Creating tasks and task images...");
  const taskStatuses = ["pending", "in_progress", "completed"];

  for (const user of users) {
    const tasksToCreate = faker.number.int({ min: 2, max: 5 });

    for (let i = 0; i < tasksToCreate; i++) {
      await prisma.task.create({
        data: {
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(taskStatuses),
          userId: user.id,
          // Create a task image for some tasks (50% chance)
          taskImage:
            faker.number.int({ min: 1, max: 2 }) === 1
              ? {
                  create: {
                    url: faker.image.url(),
                  },
                }
              : undefined,
        },
      });
    }
  }
}

async function createBots(count = 3) {
  console.log("🤖 Creating bots...");

  for (let i = 0; i < count; i++) {
    await prisma.bot.create({
      data: {
        name: faker.company.name() + " Bot",
        apiKey: faker.string.uuid(),
      },
    });
  }
}

async function cleanDatabase() {
  await prisma.taskImage.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.bot.deleteMany();
}

async function seed() {
  console.log("🌱 Starting seeding...");

  // Clean up existing data
  console.time("🧹 Cleaned up the database...");
  await cleanDatabase();
  console.timeEnd("🧹 Cleaned up the database...");

  console.time(`🌱 Database has been seeded`);
  const users = await createUsers();
  await createTasksForUsers(users);
  await createBots();
  console.timeEnd(`🌱 Database has been seeded`);
}

seed()
  .catch(error => {
    console.error("Error during seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
