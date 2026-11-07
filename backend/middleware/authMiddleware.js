import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "FoodBridgeSuperSecretKey2026"
      );

      // Try finding user in database
      let user = null;
      try {
        user = await User.findById(decoded.id).select("-password");
      } catch (dbErr) {
        // If DB not connected or memory mode
        if (req.app.locals.memoryUsers) {
          user = req.app.locals.memoryUsers.find(
            (u) => String(u._id) === String(decoded.id)
          );
        }
      }

      // Check app locals memory fallback if not found in db
      if (!user && req.app.locals.memoryUsers) {
        user = req.app.locals.memoryUsers.find(
          (u) => String(u._id) === String(decoded.id)
        );
      }

      if (!user) {
        return res.status(401).json({ message: "User not found or token invalid" });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error("Auth verification error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
