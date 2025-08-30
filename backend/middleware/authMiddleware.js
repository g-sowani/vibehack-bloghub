import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = { id: user._id, role: user.role }; // Match token payload
    console.log("User:", req.user); // Add this for debugging
    next();
  } catch (error) {
    console.log("Token:", token);
    console.log("Error Details:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Roles allowed:", roles, "User role:", req.user.role); // Add this
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized for this action" });
    }
    next();
  };
};