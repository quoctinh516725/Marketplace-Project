import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";
import { UserRole, UserStatus } from "../src/constants";

type SeedUser = {
  email: string;
  username: string;
  fullName: string;
  roleCode: string;
};

const DEFAULT_PASSWORD = "123456";

const seedUsers: SeedUser[] = [
  {
    email: "admin.seed@marketplace.local",
    username: "admin_seed",
    fullName: "Seed Admin",
    roleCode: UserRole.ADMIN,
  },
  {
    email: "user.seed@marketplace.local",
    username: "user_seed",
    fullName: "Seed User",
    roleCode: UserRole.USER,
  },
  {
    email: "staff.seed@marketplace.local",
    username: "staff_seed",
    fullName: "Seed Staff",
    roleCode: UserRole.STAFF,
  },
  {
    email: "seller.seed2@marketplace.local",
    username: "seller_seed2",
    fullName: "Seed Seller",
    roleCode: UserRole.SELLER,
  },
];

async function seedUsersWithRoles() {
  console.log("Seeding users with roles...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const item of seedUsers) {
    const role = await prisma.role.findUnique({
      where: { code: item.roleCode },
      select: { id: true, code: true },
    });

    if (!role) {
      throw new Error(
        `Role ${item.roleCode} not found. Run prisma/seed.ts first.`,
      );
    }

    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        username: item.username,
        fullName: item.fullName,
        status: UserStatus.ACTIVE,
      },
      create: {
        email: item.email,
        username: item.username,
        password: passwordHash,
        fullName: item.fullName,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });

    console.log(`Seeded ${item.roleCode}: ${item.email}`);
  }

  console.log("Seed users completed.");
  console.log(`Default password for all seeded users: ${DEFAULT_PASSWORD}`);
}

seedUsersWithRoles()
  .catch((error) => {
    console.error("Seed users failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seedUsersWithRoles;
