// controller
const svc = require("../services/item.service");

exports.getItems = async (req,res,next) => { try { res.json(await svc.getItems(req.query)); } catch(e){next(e);} };
exports.getById  = async (req,res,next) => { try { res.json({ item: await svc.getById(req.params.id) }); } catch(e){next(e);} };
exports.getMine  = async (req,res,next) => { try { res.json({ items: await svc.getMine(req.user.id) }); } catch(e){next(e);} };
exports.create   = async (req,res,next) => {
  try {
    const urls = (req.files||[]).map(f=>f.path);
    if (!urls.length) return res.status(400).json({ error:"At least one image is required." });
    res.status(201).json({ message:"Item listed!", item: await svc.create(req.user.id, req.body, urls) });
  } catch(e){next(e);}
};
exports.update = async (req,res,next) => { try { res.json({ item: await svc.update(req.params.id, req.user.id, req.body) }); } catch(e){next(e);} };
exports.remove = async (req,res,next) => { try { res.json(await svc.remove(req.params.id, req.user.id)); } catch(e){next(e);} };
