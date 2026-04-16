// controller
const svc = require("../services/wishlist.service");
exports.get    = async (req,res,next) => { try { res.json({ wishlist: await svc.get(req.user.id) }); } catch(e){next(e);} };
exports.add    = async (req,res,next) => { try { res.status(201).json({ message:"Added to wishlist!", entry: await svc.add(req.user.id, req.params.itemId) }); } catch(e){next(e);} };
exports.remove = async (req,res,next) => { try { res.json(await svc.remove(req.user.id, req.params.itemId)); } catch(e){next(e);} };
