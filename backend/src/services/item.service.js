const prisma = require("../config/prisma");

const sellerSelect = { id:true, firstName:true, lastName:true, avatar:true, rating:true };

exports.getItems = async ({ category, size, condition, search, minPoints, maxPoints, page=1, limit=12 }) => {
  const where = { status: "ACTIVE" };
  if (category) where.category = category.toUpperCase();
  if (size) where.size = size.toUpperCase();
  if (condition) where.condition = condition.toUpperCase();
  if (minPoints || maxPoints) { where.points = {}; if (minPoints) where.points.gte = +minPoints; if (maxPoints) where.points.lte = +maxPoints; }
  if (search) where.OR = [{ title:{ contains:search, mode:"insensitive" } }, { brand:{ contains:search, mode:"insensitive" } }, { tags:{ has: search.toLowerCase() } }];
  const skip = (+page-1) * +limit;
  const [items, total] = await Promise.all([
    prisma.item.findMany({ where, skip, take:+limit, orderBy:{ createdAt:"desc" }, include:{ seller:{ select: sellerSelect } } }),
    prisma.item.count({ where }),
  ]);
  return { items, pagination:{ total, page:+page, limit:+limit, totalPages: Math.ceil(total/+limit) } };
};

exports.getById = async (id) => {
  const item = await prisma.item.findUnique({ where:{ id:+id }, include:{ seller:{ select:{...sellerSelect, location:true, reviewCount:true} } } });
  if (!item) { const e=new Error("Item not found."); e.status=404; throw e; }
  prisma.item.update({ where:{ id:+id }, data:{ views:{ increment:1 } } }).catch(()=>{});
  return item;
};

exports.getMine = (sellerId) => prisma.item.findMany({ where:{ sellerId }, orderBy:{ createdAt:"desc" } });

exports.create = async (userId, data, imageUrls) => {
  const toArr = (v) => Array.isArray(v) ? v : (v||"").split(",").map(s=>s.trim()).filter(Boolean);
  return prisma.item.create({
    data: {
      title: data.title, description: data.description, brand: data.brand||null,
      category: data.category.toUpperCase(), size: data.size.toUpperCase(),
      condition: data.condition.toUpperCase().replace(/ /g,"_"),
      points: +data.points,
      exchangeType: (data.exchangeType||"POINTS_ONLY").toUpperCase().replace(/ /g,"_"),
      tradePrefs: data.tradePrefs||null,
      tags: toArr(data.tags),
      images: imageUrls,
      sellerId: userId,
    },
    include: { seller:{ select: sellerSelect } },
  });
};

exports.update = async (id, userId, data) => {
  const item = await prisma.item.findUnique({ where:{ id:+id } });
  if (!item) { const e=new Error("Item not found."); e.status=404; throw e; }
  if (item.sellerId !== userId) { const e=new Error("Forbidden."); e.status=403; throw e; }
  return prisma.item.update({ where:{ id:+id }, data:{ title:data.title, description:data.description, brand:data.brand, points:data.points?+data.points:undefined } });
};

exports.remove = async (id, userId) => {
  const item = await prisma.item.findUnique({ where:{ id:+id } });
  if (!item) { const e=new Error("Item not found."); e.status=404; throw e; }
  if (item.sellerId !== userId) { const e=new Error("Forbidden."); e.status=403; throw e; }
  await prisma.item.delete({ where:{ id:+id } });
  return { message:"Listing deleted." };
};
