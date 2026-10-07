import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({
      success: false,
      message: 'User no longer exists'
    });
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
  next();
}
