import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Lab from '../models/Lab.js';
import Attendance from '../models/Attendance.js';
import Practical from '../models/Practical.js';
import Progress from '../models/Progress.js';
await mongoose.connect(process.env.MONGO_URI);
try {
  // This demo seed intentionally resets app collections before inserting sample data.
  await Promise.all([User.deleteMany({}), Lab.deleteMany({}), Attendance.deleteMany({}), Practical.deleteMany({}), Progress.deleteMany({})]);
  const admin = await User.create({
    name: 'Dr. Sharma',
    email: 'admin@iips.edu',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
    semester: '9',
    branch: 'MCA'
  });
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = await User.insertMany([{
    name: 'Rahul Verma',
    email: 'student1@iips.edu',
    studentId: 'IIPS2021'
  }, {
    name: 'Kunal Patel',
    email: 'student2@iips.edu',
    studentId: 'IIPS2022'
  }, {
    name: 'Amit Joshi',
    email: 'student3@iips.edu',
    studentId: 'IIPS2023'
  }, {
    name: 'Neha Singh',
    email: 'student4@iips.edu',
    studentId: 'IIPS2024'
  }].map(student => ({
    ...student,
    password: studentPassword,
    role: 'student',
    semester: '9',
    branch: 'MCA'
  })));
  const labs = await Lab.insertMany([{
    labName: 'OOAD Lab',
    subject: 'OOAD',
    semester: '9',
    branch: 'MCA',
    faculty: 'Dr. Sharma',
    date: '2026-10-10',
    startTime: '10:00',
    endTime: '12:00',
    room: 'Lab 3'
  }, {
    labName: 'MM Lab',
    subject: 'MM',
    semester: '9',
    branch: 'MCA',
    faculty: 'Prof. Mehta',
    date: '2026-10-12',
    startTime: '13:00',
    endTime: '15:00',
    room: 'Lab 2'
  }, {
    labName: 'OOAD Lab',
    subject: 'OOAD',
    semester: '9',
    branch: 'MCA',
    faculty: 'Dr. Sharma',
    date: '2026-10-15',
    startTime: '10:00',
    endTime: '12:00',
    room: 'Lab 3'
  }]);
  const attendance = [];
  students.forEach((student, studentIndex) => {
    labs.forEach((lab, labIndex) => {
      attendance.push({
        student: student._id,
        lab: lab._id,
        status: (studentIndex + labIndex) % 4 === 0 ? 'absent' : 'present',
        date: lab.date
      });
    });
  });
  await Attendance.insertMany(attendance);
  const practicals = await Practical.insertMany([{
    title: 'OOAD Use Case and Class Diagram',
    description: 'Model a simple college registration system.',
    subject: 'OOAD',
    semester: '9',
    branch: 'MCA',
    deadline: '2026-10-20',
    createdBy: admin._id
  }, {
    title: 'MM Image and Audio Editing',
    description: 'Create a small multimedia composition using image and audio assets.',
    subject: 'MM',
    semester: '9',
    branch: 'MCA',
    deadline: '2026-10-25',
    createdBy: admin._id
  }, {
    title: 'OOAD Sequence Diagram',
    description: 'Show the interaction flow for a student lab booking.',
    subject: 'OOAD',
    semester: '9',
    branch: 'MCA',
    deadline: '2026-10-30',
    createdBy: admin._id
  }]);
  const statuses = ['completed', 'in-progress', 'pending'];
  await Progress.insertMany(students.flatMap((student, studentIndex) => practicals.map((practical, practicalIndex) => {
    const status = statuses[(studentIndex + practicalIndex) % statuses.length];
    return {
      student: student._id,
      practical: practical._id,
      status,
      submissionDate: status === 'completed' ? '2026-10-01' : null
    };
  })));
  console.log('Seed complete. Semester 9 OOAD/MM demo accounts and records are ready.');
  console.log('Admin: admin@iips.edu / admin123');
  console.log('Students: student1@iips.edu through student4@iips.edu / student123');
} finally {
  await mongoose.disconnect();
}
