const mongoose = require("mongoose");
const Role = require("../../models/roles"); // Role model
const User = require("../../models/users"); // User model (update with correct path)
const defaultRoles = require("../../config/defaultRoles"); // Default roles configuration
require('dotenv').config();

// Function to seed roles for a single company
const createRolesSeed = async (companyId) => {
  if (!companyId) {
    throw new Error("A company ID is required to seed roles.");
  }

  // Seed data for roles
  const seedData = Object.keys(defaultRoles).map((roleName) => ({
    name: roleName,
    description: defaultRoles[roleName],
    company: companyId,
  }));

  console.log("Seeding the following roles:", seedData);

  // Clear existing roles for the company (optional, for idempotence)
  await Role.deleteMany({ company: companyId, deletedAt: null });

  // Insert new roles and capture the inserted roles
  const insertedRoles = await Role.insertMany(seedData);
  console.log("Roles seeded successfully!");

  return insertedRoles;
};

// Function to update users with the new roles
const updateUsersWithNewRoles = async (users, newRoles) => {
  // Fetch all users in the company with populated role names
  // Create a map of role names to role _ids
  const roleNameToIdMap = newRoles.reduce((acc, role) => {
    acc[role.name] = role._id;
    return acc;
  }, {});

  // Loop through each user and update their role based on the new role name
  for (let user of users) {
    if (user.role && roleNameToIdMap[user.role.name]) {
      console.log(roleNameToIdMap[user.role.name])
      user.role = roleNameToIdMap[user.role.name]; // Assign new role ID
      await user.save(); // Save the user with the new role
      console.log(`Updated user ${user._id} with new role ${user.role}`);
    }
  }
  console.log("Users updated with new roles!");
};

const runSeed = async () => {
  const companyId = process.argv[2]; // Accept company ID as a command-line argument
  if (!companyId) {
    console.error("Usage: node seeds/roleSeed.js <companyId>");
    process.exit(1);
  }

  try {
    // Connect to your MongoDB
    mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DBNAME,
      })
      .then(() => console.log("Database connected"))
      .catch((err) => console.error(err));

    const users = await User.find({ company: new mongoose.Types.ObjectId(companyId), deletedAt: null }).populate('role', 'name');

    // Step 1: Seed roles and capture the inserted roles
    const insertedRoles = await createRolesSeed(new mongoose.Types.ObjectId(companyId));

    // Step 2: Update users with the new roles
    await updateUsersWithNewRoles(users, insertedRoles);

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding roles:", error);
    process.exit(1);
  }
};

runSeed();
