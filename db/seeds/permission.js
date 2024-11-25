const mongoose = require("mongoose");
const authCodes = require("../../config/authCodes"); // Path to your auth codes
const Permission = require("../../models/permissions"); // Update with your permission model path
require('dotenv').config();

// Function to create seed data
const createPermissionsSeed = async (companyId) => {
  if (!companyId) {
    throw new Error("Company ID is required to seed permissions.");
  }

  const seedData = [];

  // Iterate through authCodes to create seed data
Object.keys(authCodes).forEach((module) => {
  Object.keys(authCodes[module]).forEach((action) => {
    let separatedAction = action;
    
    // Check if 'By' is present in the action to split it
    if (action.includes("By")) {
      separatedAction = action.replace(/([a-z])([A-Z])/g, '$1 $2').split("By").map((action) => action.trim().toLowerCase());
      // Combine the split parts into a readable format, you can adjust this as needed
      description = `${separatedAction[0]} ${module} by ${separatedAction[1]}` // Example: read user by company
    } else if (action.includes("One")) {
      // Handle the "One" case by splitting and adding space before 'One'
      separatedAction = action.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([a-z])One/g, '$1 One').trim().toLowerCase();
      description = `${separatedAction} ${module}` // Example: read one user
    } else {
      // If no "By" exists, no separation
      description = `${action} ${module}` // Example: create user
    }

    // Push the seed data with the appropriate description
    seedData.push({
      name: authCodes[module][action],
      description: description,  // Use the separated action for description
      company: companyId,
    });
  });
});


  console.log("Seeding the following permissions:", seedData);

  // Clear existing permissions for the company (optional, for idempotence)
  await Permission.deleteMany({ company: companyId, deletedAt: null });

  // Insert new permissions
  await Permission.insertMany(seedData);
  console.log("Permissions seeded successfully!");
};

const runSeed = async () => {
  const companyId = process.argv[2]; // Accept company ID from the command line
  if (!companyId) {
    console.error("Usage: node seeds/permissionSeed.js <companyId>");
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
    console.log(companyId);
    await createPermissionsSeed(new mongoose.Types.ObjectId(companyId));

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding permissions:", error);
    process.exit(1);
  }
};

runSeed();
