// controller
const svc = require("../services/user.service");
exports.getProfile     = async (req,res,next) => { try { res.json({ user: await svc.getProfile(req.params.id) }); } catch(e){next(e);} };
exports.updateMe       = async (req,res,next) => { try { res.json({ user: await svc.updateMe(req.user.id, req.body, req.file?.path) }); } catch(e){next(e);} };
exports.changePassword = async (req,res,next) => { try { res.json(await svc.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword)); } catch(e){next(e);} };
