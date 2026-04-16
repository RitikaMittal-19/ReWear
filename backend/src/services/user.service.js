// service
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

exports.getProfile = async (id) => {
  const u = await prisma.user.findUnique({ where:{ id:+id }, select:{ id:true,firstName:true,lastName:true,avatar:true,bio:true,location:true,rating:true,reviewCount:true,createdAt:true,_count:{select:{listings:true}} } });
  if (!u) { const e=new Error("User not found."); e.status=404; throw e; }
  return u;
};

exports.updateMe = async (userId, data, avatarUrl) => {
  const upd = {};
  ["firstName","lastName","bio","location","preferredSizes"].forEach(k => { if (data[k] !== undefined) upd[k] = data[k]; });
  if (avatarUrl) upd.avatar = avatarUrl;
  return prisma.user.update({ where:{ id:userId }, data:upd,
    select:{ id:true,email:true,firstName:true,lastName:true,bio:true,location:true,avatar:true,points:true,rating:true,preferredSizes:true } });
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const u = await prisma.user.findUnique({ where:{ id:userId } });
  if (!(await bcrypt.compare(currentPassword, u.password))) { const e=new Error("Current password incorrect."); e.status=400; throw e; }
  await prisma.user.update({ where:{ id:userId }, data:{ password: await bcrypt.hash(newPassword, 12) } });
  return { message:"Password changed." };
};
