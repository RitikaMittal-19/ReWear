// controller
const svc = require("../services/order.service");
exports.getMine   = async (req,res,next) => { try { res.json(await svc.getMine(req.user.id)); } catch(e){next(e);} };
exports.request   = async (req,res,next) => { try { res.status(201).json({ message:"Request sent!", order: await svc.request(req.user.id, req.body.itemId, req.body.note) }); } catch(e){next(e);} };
exports.accept    = async (req,res,next) => { try { res.json({ message:"Accepted! Points transferred. 🎉", order: await svc.accept(req.params.id, req.user.id) }); } catch(e){next(e);} };
exports.reject    = async (req,res,next) => { try { res.json({ message:"Request rejected.", order: await svc.reject(req.params.id, req.user.id) }); } catch(e){next(e);} };
exports.complete  = async (req,res,next) => { try { res.json({ message:"Marked complete!", order: await svc.complete(req.params.id, req.user.id) }); } catch(e){next(e);} };
