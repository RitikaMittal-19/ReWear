const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const sign = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
const safe = ({ password, ...u }) => u;

const register = async ({ firstName, lastName, email, password }) => {
  if (await prisma.user.findUnique({ where: { email } })) {
    const e = new Error("Email already registered."); e.status = 409; throw e;
  }
  const user = await prisma.user.create({ data: { firstName, lastName, email, password: await bcrypt.hash(password, 12), points: 100 } });
  return { user: safe(user), token: sign(user.id) };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const e = new Error("Invalid email or password."); e.status = 401; throw e;
  }
  if (!user.isActive) { const e = new Error("Account deactivated."); e.status = 403; throw e; }
  return { user: safe(user), token: sign(user.id) };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id:true, email:true, firstName:true, lastName:true, bio:true, location:true, avatar:true, points:true, role:true, rating:true, reviewCount:true, preferredSizes:true, createdAt:true,
      _count: { select: { listings: true, ordersBuyer: true } } },
  });
  if (!user) { const e = new Error("User not found."); e.status = 404; throw e; }
  return user;
};

module.exports = { register, login, getMe };
