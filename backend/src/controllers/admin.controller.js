// controller
const svc = require("../services/admin.service");
exports.getStats    = async (req,res,next) => { try { res.json(await svc.getStats()); } catch(e){next(e);} };
exports.getUsers    = async (req,res,next) => { try { res.json({ users: await svc.getUsers(req.query) }); } catch(e){next(e);} };
exports.updateUser  = async (req,res,next) => { try { res.json(await svc.updateUser(req.params.id, req.body)); } catch(e){next(e);} };
exports.getItems    = async (req,res,next) => { try { res.json({ items: await svc.getItems(req.query) }); } catch(e){next(e);} };
exports.updateItem  = async (req,res,next) => { try { res.json(await svc.updateItem(req.params.id, req.body.status)); } catch(e){next(e);} };
exports.getOrders   = async (req,res,next) => { try { res.json({ orders: await svc.getOrders(req.query) }); } catch(e){next(e);} };
