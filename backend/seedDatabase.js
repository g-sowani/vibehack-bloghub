import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Blog from "./models/Blog.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = new User({
      username: "admin",
      email: "admin@bloghub.com",
      password: hashedAdminPassword,
      role: "admin"
    });
    await adminUser.save();
    console.log("Admin user created: admin@bloghub.com / admin123");

    // Create regular user
    const hashedUserPassword = await bcrypt.hash("user123", 10);
    const regularUser = new User({
      username: "user",
      email: "user@bloghub.com",
      password: hashedUserPassword,
      role: "user"
    });
    await regularUser.save();
    console.log("Regular user created: user@bloghub.com / user123");

    // Create some sample blogs with likes and comments
    const sampleBlogs = [
      {
        title: "Welcome to BlogHub",
        content: "This is a sample approved blog post. Welcome to our blogging platform! Feel free to like and comment on this post.",
        author: adminUser._id,
        status: "approved",
        likes: [regularUser._id], // User liked this blog
        comments: [
          {
            author: regularUser._id,
            content: "Great platform! Looking forward to more content.",
            username: regularUser.username
          }
        ]
      },
      {
        title: "Getting Started with Blogging",
        content: "This is a sample pending blog post that needs approval from an admin. It includes some tips for new bloggers.",
        author: regularUser._id,
        status: "pending",
        likes: [adminUser._id], // Admin liked this blog
        comments: [
          {
            author: adminUser._id,
            content: "This looks promising! Will review soon.",
            username: adminUser.username
          }
        ]
      },
      {
        title: "The Power of Community",
        content: "Blogging is not just about writing, it's about building a community. Engage with your readers through comments and likes!",
        author: adminUser._id,
        status: "approved",
        likes: [regularUser._id, adminUser._id], // Both users liked this
        comments: [
          {
            author: regularUser._id,
            content: "Absolutely agree! Community engagement is key.",
            username: regularUser.username
          },
          {
            author: adminUser._id,
            content: "Well said! Looking forward to more community features.",
            username: adminUser.username
          }
        ]
      }
    ];

    for (const blogData of sampleBlogs) {
      const blog = new Blog(blogData);
      await blog.save();
    }
    console.log("Sample blogs with likes and comments created");

    console.log("\nDatabase seeded successfully!");
    console.log("You can now login with:");
    console.log("Admin: admin@bloghub.com / admin123");
    console.log("User: user@bloghub.com / user123");
    console.log("\nSample blogs include likes and comments for testing!");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
