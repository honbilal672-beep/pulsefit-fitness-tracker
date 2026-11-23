import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "pulsefit_dev_jwt_secret_key_change_in_prod";
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token missing or invalid. Please log in."
      });
      return;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again."
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: "Invalid authorization token. Access denied."
    });
  }
};
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access forbidden: Administrative privileges required."
    });
    return;
  }
  next();
};
const optionalAuth = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
  }
  next();
};
const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    username: user.username
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  });
};
export {
  generateToken,
  optionalAuth,
  requireAdmin,
  verifyToken
};
