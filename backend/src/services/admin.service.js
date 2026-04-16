// service
const prisma = require("../config/prisma");

exports.getStats = async () => {
  const [users, items, orders, completed] = await Promise.all([
    prisma.user.count(), prisma.item.count(), prisma.order.count(),
    prisma.order.count({ where:{ status:"COMPLETED" } }),
  ]);
  return { totalUsers:users, totalItems:items, totalOrders:orders, completedOrders:completed };
};

exports.getUsers = ({ page=1, limit=20, search }) => {
  const where = search ? { OR:[{ email:{ contains:search,mode:"insensitive" } },{ firstName:{ contains:search,mode:"insensitive" } }] } : {};
  return prisma.user.findMany({ where, skip:(+page-1)*+limit, take:+limit, orderBy:{ createdAt:"desc" },
    select:{ id:true,email:true,firstName:true,lastName:true,avatar:true,role:true,isActive:true,points:true,rating:true,createdAt:true,_count:{ select:{ listings:true,ordersBuyer:true } } } });
};

exports.updateUser = (id, data) => prisma.user.update({ where:{ id:+id }, data:{
  ...(data.isActive !== undefined && { isActive: data.isActive === "true" || data.isActive === true }),
  ...(data.role && { role: data.role }),
}, select:{ id:true,email:true,isActive:true,role:true } });

exports.getItems = ({ page=1, limit=20, status }) => {
  const where = status ? { status:status.toUpperCase() } : {};
  return prisma.item.findMany({ where, skip:(+page-1)*+limit, take:+limit, orderBy:{ createdAt:"desc" },
    include:{ seller:{ select:{ id:true,firstName:true,lastName:true,email:true } } } });
};

exports.updateItem = (id, status) => prisma.item.update({ where:{ id:+id }, data:{ status:status.toUpperCase() }, select:{ id:true,title:true,status:true } });

exports.getOrders = ({ page=1, limit=20 }) => prisma.order.findMany({ skip:(+page-1)*+limit, take:+limit, orderBy:{ createdAt:"desc" },
  include:{ item:{ select:{ id:true,title:true,images:true } }, buyer:{ select:{ id:true,firstName:true,lastName:true,email:true } }, seller:{ select:{ id:true,firstName:true,lastName:true,email:true } } } });
