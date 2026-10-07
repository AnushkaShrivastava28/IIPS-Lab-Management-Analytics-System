import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const tokenFor = u => jwt.sign({
  id: u._id
}, process.env.JWT_SECRET, {
  expiresIn: '7d'
});
const safe = u => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  studentId: u.studentId,
  semester: u.semester,
  branch: u.branch
});
export async function login(req, res) {
  const {
    email,
    password
  } = req.body;
  if (!email || !password) return res.status(400).json({
    success: false,
    message: 'Email and password are required'
  });
  const u = await User.findOne({
    email: email.toLowerCase()
  }).select('+password');
  if (!u || !(await bcrypt.compare(password, u.password))) return res.status(401).json({
    success: false,
    message: 'Invalid email or password'
  });
  res.json({
    success: true,
    token: tokenFor(u),
    user: safe(u)
  });
}
export async function register(req, res) {
  const {
    name,
    email,
    password,
    studentId,
    semester,
    branch
  } = req.body;
  if (!name || !email || !password || !studentId || !semester || !branch) return res.status(400).json({
    success: false,
    message: 'All student fields are required'
  });
  if (String(semester) !== '9' || branch !== 'MCA') return res.status(400).json({
    success: false,
    message: 'Registration is limited to semester 9 MCA students'
  });
  const exists = await User.findOne({
    $or: [{
      email: email.toLowerCase()
    }, {
      studentId
    }]
  });
  if (exists) return res.status(409).json({
    success: false,
    message: 'Email or student ID already exists'
  });
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    studentId,
    semester: '9',
    branch: 'MCA',
    role: 'student'
  });
  res.status(201).json({
    success: true,
    user: safe(user)
  });
}
export async function me(req, res) {
  res.json({
    success: true,
    user: safe(req.user)
  });
}
