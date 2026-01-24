import { prisma } from "../src/config/prisma";
import { UserRole } from "../src/constants";
import { PermissionCode } from "../src/constants/permissionCode";
import { RoleStatus } from "../src/constants/roleStatus";

/**
 * Seed roles and permissions
 */
async function seedRolesAndPermissions() {
  console.log("🌱 Seeding roles and permissions...");

  try {
    // Create Roles
    const roles = [
      {
        code: UserRole.ADMIN,
        name: "Administrator",
        description: "Full system access",
        status: RoleStatus.ACTIVE,
      },
      {
        code: UserRole.USER,
        name: "User",
        description: "Regular customer",
        status: RoleStatus.ACTIVE,
      },
      {
        code: UserRole.SELLER,
        name: "Seller",
        description: "Shop owner",
        status: RoleStatus.ACTIVE,
      },
      {
        code: UserRole.STAFF,
        name: "Staff",
        description: "Platform staff",
        status: RoleStatus.ACTIVE,
      },
      {
        code: UserRole.GUEST,
        name: "Guest",
        description: "Guest user (not logged in)",
        status: RoleStatus.ACTIVE,
      },
    ];

    for (const roleData of roles) {
      await prisma.role.upsert({
        where: { code: roleData.code },
        update: {},
        create: roleData,
      });
      console.log(`✅ Role ${roleData.code} created/updated`);
    }

    // Create Permissions
    const permissions = [
      // User Management
      {
        code: PermissionCode.CREATE_USER,
        description: "Create new users",
      },
      {
        code: PermissionCode.UPDATE_USER,
        description: "Update user information",
      },
      {
        code: PermissionCode.DELETE_USER,
        description: "Delete users",
      },
      {
        code: PermissionCode.VIEW_USER,
        description: "View user information",
      },
      {
        code: PermissionCode.MANAGE_USER_STATUS,
        description: "Manage user status",
      },

      // Product Management
      {
        code: PermissionCode.CREATE_PRODUCT,
        description: "Create products",
      },
      {
        code: PermissionCode.UPDATE_PRODUCT,
        description: "Update products",
      },
      {
        code: PermissionCode.DELETE_PRODUCT,
        description: "Delete products",
      },
      {
        code: PermissionCode.VIEW_PRODUCT,
        description: "View products",
      },
      {
        code: PermissionCode.APPROVE_PRODUCT,
        description: "Approve products",
      },

      // Order Management
      {
        code: PermissionCode.CREATE_ORDER,
        description: "Create orders",
      },
      {
        code: PermissionCode.UPDATE_ORDER,
        description: "Update orders",
      },
      {
        code: PermissionCode.VIEW_ORDER,
        description: "View orders",
      },
      {
        code: PermissionCode.CANCEL_ORDER,
        description: "Cancel orders",
      },
      {
        code: PermissionCode.MANAGE_ORDERS,
        description: "Manage all orders",
      },

      // Shop Management
      {
        code: PermissionCode.CREATE_SHOP,
        description: "Create shops",
      },
      {
        code: PermissionCode.UPDATE_SHOP,
        description: "Update shops",
      },
      {
        code: PermissionCode.DELETE_SHOP,
        description: "Delete shops",
      },
      { code: PermissionCode.VIEW_SHOP, description: "View shops" },
      {
        code: PermissionCode.MANAGE_SHOP_STATUS,
        description: "Manage shop status",
      },

      // Category & Brand
      {
        code: PermissionCode.CREATE_CATEGORY,
        description: "Create categories",
      },
      {
        code: PermissionCode.UPDATE_CATEGORY,
        description: "Update categories",
      },
      {
        code: PermissionCode.DELETE_CATEGORY,
        description: "Delete categories",
      },
      {
        code: PermissionCode.CREATE_BRAND,
        description: "Create brands",
      },
      {
        code: PermissionCode.UPDATE_BRAND,
        description: "Update brands",
      },
      {
        code: PermissionCode.DELETE_BRAND,
        description: "Delete brands",
      },

      // Review & Rating
      {
        code: PermissionCode.CREATE_REVIEW,
        description: "Create reviews",
      },
      {
        code: PermissionCode.UPDATE_REVIEW,
        description: "Update reviews",
      },
      {
        code: PermissionCode.DELETE_REVIEW,
        description: "Delete reviews",
      },
      {
        code: PermissionCode.MODERATE_REVIEW,
        description: "Moderate reviews",
      },

      // Voucher & Promotion
      {
        code: PermissionCode.CREATE_VOUCHER,
        description: "Create vouchers",
      },
      {
        code: PermissionCode.UPDATE_VOUCHER,
        description: "Update vouchers",
      },
      {
        code: PermissionCode.DELETE_VOUCHER,
        description: "Delete vouchers",
      },
      {
        code: PermissionCode.MANAGE_PLATFORM_VOUCHER,
        description: "Manage platform vouchers",
      },

      // Admin & System
      {
        code: PermissionCode.MANAGE_ROLES,
        description: "Manage roles",
      },
      {
        code: PermissionCode.MANAGE_PERMISSIONS,
        description: "Manage permissions",
      },
      {
        code: PermissionCode.VIEW_AUDIT_LOG,
        description: "View audit logs",
      },
      {
        code: PermissionCode.MANAGE_SYSTEM_SETTINGS,
        description: "Manage system settings",
      },

      // Address Management
      {
        code: PermissionCode.CREATE_ADDRESS,
        description: "Create addresses",
      },
      {
        code: PermissionCode.UPDATE_ADDRESS,
        description: "Update addresses",
      },
      {
        code: PermissionCode.DELETE_ADDRESS,
        description: "Delete addresses",
      },

      // Reports
      {
        code: PermissionCode.VIEW_SHOP_REPORTS,
        description: "View shop reports",
      },
      {
        code: PermissionCode.VIEW_SYSTEM_REPORTS,
        description: "View system reports",
      },

      // Disputes
      {
        code: PermissionCode.MANAGE_DISPUTES,
        description: "Manage disputes",
      },
    ];

    for (const permData of permissions) {
      await prisma.permission.upsert({
        where: { code: permData.code },
        update: {},
        create: permData,
      });
      console.log(`✅ Permission ${permData.code} created/updated`);
    }

    // Assign Permissions to Roles
    const adminRole = await prisma.role.findUnique({
      where: { code: UserRole.ADMIN },
    });
    const userRole = await prisma.role.findUnique({
      where: { code: UserRole.USER },
    });
    const sellerRole = await prisma.role.findUnique({
      where: { code: UserRole.SELLER },
    });
    const staffRole = await prisma.role.findUnique({
      where: { code: UserRole.STAFF },
    });

    if (!adminRole || !userRole || !sellerRole || !staffRole) {
      throw new Error("Roles not found");
    }

    // ADMIN: All permissions
    const allPermissions = await prisma.permission.findMany();
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`✅ All permissions assigned to ADMIN role`);

    // USER: Basic permissions
    const userPermissions = [
      PermissionCode.CREATE_ORDER,
      PermissionCode.VIEW_ORDER,
      PermissionCode.CANCEL_ORDER,
      PermissionCode.CREATE_REVIEW,
      PermissionCode.UPDATE_REVIEW,
      PermissionCode.DELETE_REVIEW,
      PermissionCode.CREATE_ADDRESS,
      PermissionCode.UPDATE_ADDRESS,
      PermissionCode.DELETE_ADDRESS,
      PermissionCode.VIEW_PRODUCT,
      PermissionCode.VIEW_SHOP,
    ];

    for (const permCode of userPermissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: userRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`✅ User permissions assigned to USER role`);

    // SELLER: Seller permissions (includes all USER permissions)
    const sellerPermissions = [
      ...userPermissions,
      PermissionCode.CREATE_SHOP,
      PermissionCode.UPDATE_SHOP,
      PermissionCode.CREATE_PRODUCT,
      PermissionCode.UPDATE_PRODUCT,
      PermissionCode.DELETE_PRODUCT,
      PermissionCode.UPDATE_ORDER, // For own shop orders
      PermissionCode.CREATE_VOUCHER,
      PermissionCode.UPDATE_VOUCHER,
      PermissionCode.DELETE_VOUCHER,
      PermissionCode.VIEW_SHOP_REPORTS,
    ];

    for (const permCode of sellerPermissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: sellerRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: sellerRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`✅ Seller permissions assigned to SELLER role`);

    // STAFF: Staff permissions
    const staffPermissions = [
      PermissionCode.APPROVE_PRODUCT,
      PermissionCode.MODERATE_REVIEW,
      PermissionCode.MANAGE_ORDERS,
      PermissionCode.VIEW_USER,
      PermissionCode.MANAGE_USER_STATUS,
      PermissionCode.VIEW_SHOP,
      PermissionCode.MANAGE_SHOP_STATUS,
      PermissionCode.MANAGE_DISPUTES,
    ];

    for (const permCode of staffPermissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: staffRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: staffRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`✅ Staff permissions assigned to STAFF role`);

    console.log("✅ Roles and permissions seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding roles and permissions:", error);
    throw error;
  }
}

// Run seed if called directly
seedRolesAndPermissions()
  .then(() => {
    console.log("✅ Seed completed");
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
export default seedRolesAndPermissions;
