const prisma = require("../config/prisma");

const itemSelect = { id:true, title:true, images:true, points:true };
const userSelect = { id:true, firstName:true, lastName:true, avatar:true };

exports.getMine = async (userId) => {
  const [buying, selling] = await Promise.all([
    prisma.order.findMany({ where:{ buyerId:userId }, include:{ item:{ select:itemSelect }, seller:{ select:userSelect } }, orderBy:{ createdAt:"desc" } }),
    prisma.order.findMany({ where:{ sellerId:userId }, include:{ item:{ select:itemSelect }, buyer:{ select:userSelect } }, orderBy:{ createdAt:"desc" } }),
  ]);
  return { buying, selling };
};

exports.request = async (buyerId, itemId, note) => {
  const item = await prisma.item.findUnique({ where:{ id:+itemId } });
  if (!item) { const e=new Error("Item not found."); e.status=404; throw e; }
  if (item.status !== "ACTIVE") { const e=new Error("Item no longer available."); e.status=400; throw e; }
  if (item.sellerId === buyerId) { const e=new Error("Cannot request your own item."); e.status=400; throw e; }
  const buyer = await prisma.user.findUnique({ where:{ id:buyerId } });
  if (buyer.points < item.points) { const e=new Error(`Need ${item.points} pts, you have ${buyer.points}.`); e.status=400; throw e; }
  const dup = await prisma.order.findFirst({ where:{ itemId:+itemId, buyerId, status:"REQUESTED" } });
  if (dup) { const e=new Error("Already requested this item."); e.status=409; throw e; }
  return prisma.order.create({
    data: { itemId:+itemId, buyerId, sellerId:item.sellerId, pointsUsed:item.points, note:note||null },
    include: { item:{ select:itemSelect }, seller:{ select:userSelect } },
  });
};

exports.accept = async (orderId, sellerId) => {
  const order = await prisma.order.findUnique({ where:{ id:+orderId } });
  if (!order) { const e=new Error("Order not found."); e.status=404; throw e; }
  if (order.sellerId !== sellerId) { const e=new Error("Only seller can accept."); e.status=403; throw e; }
  if (order.status !== "REQUESTED") { const e=new Error("Order not pending."); e.status=400; throw e; }
  const [updated] = await prisma.$transaction([
    prisma.order.update({ where:{ id:+orderId }, data:{ status:"ACCEPTED" } }),
    prisma.user.update({ where:{ id:order.buyerId }, data:{ points:{ decrement:order.pointsUsed } } }),
    prisma.user.update({ where:{ id:sellerId }, data:{ points:{ increment:order.pointsUsed } } }),
    prisma.item.update({ where:{ id:order.itemId }, data:{ status:"EXCHANGED" } }),
    prisma.order.updateMany({ where:{ itemId:order.itemId, status:"REQUESTED", id:{ not:+orderId } }, data:{ status:"REJECTED" } }),
  ]);
  return updated;
};

exports.reject = async (orderId, sellerId) => {
  const order = await prisma.order.findUnique({ where:{ id:+orderId } });
  if (!order) { const e=new Error("Order not found."); e.status=404; throw e; }
  if (order.sellerId !== sellerId) { const e=new Error("Only seller can reject."); e.status=403; throw e; }
  if (order.status !== "REQUESTED") { const e=new Error("Order not pending."); e.status=400; throw e; }
  return prisma.order.update({ where:{ id:+orderId }, data:{ status:"REJECTED" } });
};

exports.complete = async (orderId, userId) => {
  const order = await prisma.order.findUnique({ where:{ id:+orderId } });
  if (!order) { const e=new Error("Order not found."); e.status=404; throw e; }
  if (order.buyerId !== userId && order.sellerId !== userId) { const e=new Error("Not part of this order."); e.status=403; throw e; }
  if (order.status !== "ACCEPTED") { const e=new Error("Only accepted orders can be completed."); e.status=400; throw e; }
  return prisma.order.update({ where:{ id:+orderId }, data:{ status:"COMPLETED" } });
};
