const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token. Please log in." });
    const token = header.split(" ")[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, isActive: true, firstName: true, lastName: true } });
    if (!user) return res.status(401).json({ error: "User not found." });
    if (!user.isActive) return res.status(403).json({ error: "Account deactivated." });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Session expired. Please log in again." });
    return res.status(401).json({ error: "Invalid token." });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Admin access required." });
  next();
};

module.exports = { authenticate, requireAdmin };
