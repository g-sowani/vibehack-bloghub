import bcrypt from "bcryptjs";

// Create admin user
const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const adminUser = {
    id: 1,
    username: "admin",
    email: "admin@bloghub.com",
    password: hashedPassword,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  global.users.push(adminUser);
  console.log("Admin user created successfully!");
  console.log("Email: admin@bloghub.com");
  console.log("Password: admin123");
};

// Create regular user
const createRegularUser = async () => {
  const hashedPassword = await bcrypt.hash("user123", 10);
  
  const regularUser = {
    id: 2,
    username: "user",
    email: "user@bloghub.com",
    password: hashedPassword,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  global.users.push(regularUser);
  console.log("Regular user created successfully!");
  console.log("Email: user@bloghub.com");
  console.log("Password: user123");
};

// Initialize users
const initializeUsers = async () => {
  global.users = [];
  global.blogs = [];
  global.nextUserId = 1;
  global.nextBlogId = 1;
  
  await createAdminUser();
  await createRegularUser();
  
  console.log("\nUsers initialized successfully!");
  console.log("Total users:", global.users.length);
};

// Run initialization
initializeUsers().catch(console.error);
