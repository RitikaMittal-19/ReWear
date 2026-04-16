const svc = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try { const r = await svc.register(req.body); res.status(201).json({ message: "Account created!", ...r }); }
  catch (e) { next(e); }
};
exports.login = async (req, res, next) => {
  try { const r = await svc.login(req.body); res.json({ message: "Login successful!", ...r }); }
  catch (e) { next(e); }
};
exports.getMe = async (req, res, next) => {
  try { res.json({ user: await svc.getMe(req.user.id) }); }
  catch (e) { next(e); }
};
