const mongoose = require("mongoose");
const RolePermission = require("../../models/rolePermissions"); // Adjust path if necessary
const Role = require("../../models/roles"); // Adjust path if necessary
const Permission = require("../../models/permissions"); // Adjust path if necessary
const authCodes = require("../../config/authCodes"); // Import the authCodes
require('dotenv').config();

// Helper function to dynamically extract permissions based on categories
const filterPermissions = (categories, excludeRead = false) => {
  return Object.values(authCodes).flatMap(category => 
    Object.values(category).filter(code => 
      categories.some(categoryCode => code.endsWith(categoryCode)) && 
      (!excludeRead || !code.endsWith("read")) // Exclude .read permissions if needed
    )
  );
};

const rolePermissionsMapping = {
  // superAdmin gets all permissions
  superAdmin: [
    ...Object.values(authCodes.admin),
    ...Object.values(authCodes.album),
    ...Object.values(authCodes.auth),
    ...Object.values(authCodes.church),
    ...Object.values(authCodes.company),
    ...Object.values(authCodes.event),
    ...Object.values(authCodes.eventRegistration),
    ...Object.values(authCodes.permission),
    ...Object.values(authCodes.photo),
    ...Object.values(authCodes.role),
    ...Object.values(authCodes.rolePermission),
    ...Object.values(authCodes.team),
    ...Object.values(authCodes.user),
  ],

  // admin gets all permissions except company-related and .read permissions
  admin: [
    ...Object.values(authCodes.admin),
    ...Object.values(authCodes.album),
    ...Object.values(authCodes.auth),
    ...Object.values(authCodes.church),
    ...Object.values(authCodes.event),
    ...Object.values(authCodes.eventRegistration),
    ...Object.values(authCodes.permission),
    ...Object.values(authCodes.photo),
    ...Object.values(authCodes.role),
    ...Object.values(authCodes.rolePermission),
    ...Object.values(authCodes.team),
    ...Object.values(authCodes.user),
  ]
  .filter(code => !code.endsWith("CO")) // Exclude company-related permissions
  .filter(code => !code.startsWith("R")), // Exclude .read permissions

  // editor gets permissions for album, church, event, event registration, photo, and team (excluding .read permissions)
  editor: [
    ...filterPermissions(["AL", "CH", "E", "ER", "PH", "T"], true), // Exclude .read permissions
    authCodes.admin.update,
    authCodes.admin.readOne,
  ],

  // moderator gets permissions for album, event, and photo (excluding .read permissions)
  moderator: [
    ...filterPermissions(["AL", "E", "PH"], true), // Exclude .read permissions
    authCodes.admin.update,
    authCodes.admin.readOne,
  ],

  // user gets basic user permissions only
  user: [
    authCodes.user.update,
    authCodes.user.delete,
    authCodes.user.readOne,
  ],
};


const assignPermissionsToRoles = async (companyId) => {
  if (!companyId) {
    throw new Error("A company ID is required to seed role permissions.");
  }

  try {
    // Fetch roles and permissions for the specified company
    const roles = await Role.find({ company: companyId, deletedAt: null });
    const permissions = await Permission.find({ company: companyId, deletedAt: null });

    if (roles.length === 0 || permissions.length === 0) {
      throw new Error("No roles or permissions found for the specified company.");
    }

    // Prepare permission map (assuming permission code exists in permission model)
    const permissionMap = permissions.reduce((acc, permission) => {
      acc[permission.name] = permission._id; // Assuming permissions have a `code` field
      acc[`${permission.name}_description`] = permission.description; // Assuming permissions have a `code` field
      return acc;
    }, {});

    // Prepare seed data for role-permission assignments
    const seedData = [];
    for (const [roleName, permissionCodes] of Object.entries(rolePermissionsMapping)) {
      const role = roles.find((r) => r.name === roleName);

      if (!role) {
        console.warn(`Role "${roleName}" not found in the company.`);
        continue;
      }
      permissionCodes.forEach((code, idx) => {
        const permissionId = permissionMap[code];
        const description = permissionMap[`${code}_description`];

        if (!permissionId) {
          console.warn(`Permission code "${code}" not found.`);
          return;
        }

        seedData.push({
          company: companyId,
          role: role._id,
          permission: permissionId,
          name: `${role.name} ${code}`,
          description: `${role.name} has ${description} permission`,
        });
      });
    }

    // Clear existing role permissions for the company (optional)
    await RolePermission.deleteMany({ company: companyId, deletedAt: null });

    // Insert new role-permission pairs
    await RolePermission.insertMany(seedData);

    console.log("Role permissions seeded successfully!");
  } catch (error) {
    console.error("Error seeding role permissions:", error);
    throw error;
  }
};

const runSeed = async () => {
  const companyId = process.argv[2]; // Accept company ID as a command-line argument
  if (!companyId) {
    console.error("Usage: node seeds/rolePermissionSeed.js <companyId>");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    mongoose
    .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DBNAME,
    })
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(err));
    console.log(companyId);

    await assignPermissionsToRoles(new mongoose.Types.ObjectId(companyId));

    mongoose.disconnect();
  } catch (error) {
    console.error("Error running seed script:", error);
    process.exit(1);
  }
};

runSeed();
