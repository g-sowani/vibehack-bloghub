import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Blog", blogSchema);
