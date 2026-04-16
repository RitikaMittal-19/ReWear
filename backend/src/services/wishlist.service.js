// service
const prisma = require("../config/prisma");

exports.get = (userId) => prisma.wishlist.findMany({ where:{ userId }, include:{ item:{ include:{ seller:{ select:{ id:true,firstName:true,lastName:true } } } } }, orderBy:{ createdAt:"desc" } });

exports.add = async (userId, itemId) => {
  const item = await prisma.item.findUnique({ where:{ id:+itemId } });
  if (!item) { const e=new Error("Item not found."); e.status=404; throw e; }
  return prisma.wishlist.create({ data:{ userId, itemId:+itemId } });
};

exports.remove = async (userId, itemId) => {
  const w = await prisma.wishlist.findUnique({ where:{ userId_itemId:{ userId, itemId:+itemId } } });
  if (!w) { const e=new Error("Not in wishlist."); e.status=404; throw e; }
  await prisma.wishlist.delete({ where:{ userId_itemId:{ userId, itemId:+itemId } } });
  return { message:"Removed from wishlist." };
};
