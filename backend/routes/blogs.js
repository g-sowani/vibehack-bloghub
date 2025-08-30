import express from "express";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a blog
router.post("/", protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = new Blog({ title, content, author: req.user.id });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all approved blogs (accessible to all authenticated users)
router.get("/", protect, async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "approved" })
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("likes", "username");
    console.log("Fetched approved blogs:", blogs.map(b => ({ title: b.title, status: b.status })));
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending blogs (accessible to admins and users for their own blogs)
router.get("/pending", protect, async (req, res) => {
  try {
    let blogs;
    if (req.user.role === "admin") {
      // Admins can see all pending blogs
      blogs = await Blog.find({ status: "pending" })
        .populate("author", "username")
        .populate("comments.author", "username")
        .populate("likes", "username");
      console.log("Admin fetched all pending blogs:", blogs.map(b => ({ title: b.title, status: b.status, author: b.author.username })));
    } else {
      // Regular users can only see their own pending blogs
      blogs = await Blog.find({ status: "pending", author: req.user.id })
        .populate("author", "username")
        .populate("comments.author", "username")
        .populate("likes", "username");
      console.log("User fetched their pending blogs:", blogs.map(b => ({ title: b.title, status: b.status, author: b.author.username })));
    }
    res.json(blogs);
  } catch (err) {
    console.error("Error fetching pending blogs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single blog by id
router.get("/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("likes", "username");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: approve/reject a blog
router.put("/:id/status", [protect, authorize("admin")], async (req, res) => {
  try {
    const { status } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.status = status;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Like/Unlike a blog
router.post("/:id/like", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userLiked = blog.likes.includes(req.user.id);
    
    if (userLiked) {
      // Unlike
      blog.likes = blog.likes.filter(like => like.toString() !== req.user.id.toString());
    } else {
      // Like
      blog.likes.push(req.user.id);
    }
    
    await blog.save();
    
    // Populate the updated blog
    const updatedBlog = await Blog.findById(req.params.id)
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("likes", "username");
    
    res.json(updatedBlog);
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment to a blog
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const user = await User.findById(req.user.id);
    
    const comment = {
      author: req.user.id,
      content: content.trim(),
      username: user.username
    };

    blog.comments.push(comment);
    await blog.save();
    
    // Populate the updated blog
    const updatedBlog = await Blog.findById(req.params.id)
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("likes", "username");
    
    res.json(updatedBlog);
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete comment (only author or admin can delete)
router.delete("/:blogId/comments/:commentId", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if user is comment author or admin
    const user = await User.findById(req.user.id);
    if (comment.author.toString() !== req.user.id.toString() && user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    comment.remove();
    await blog.save();
    
    // Populate the updated blog
    const updatedBlog = await Blog.findById(req.params.blogId)
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("likes", "username");
    
    res.json(updatedBlog);
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;