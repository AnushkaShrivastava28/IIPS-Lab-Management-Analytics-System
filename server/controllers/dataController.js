import mongoose from 'mongoose';
import User from '../models/User.js';
import Lab from '../models/Lab.js';
import Attendance from '../models/Attendance.js';
import Practical from '../models/Practical.js';
import Progress from '../models/Progress.js';
const send = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    next(e);
  }
};
const validId = id => mongoose.Types.ObjectId.isValid(id);
const allowedSubjects = ['OOAD', 'MM'];
const isInLabScope = ({
  semester,
  subject,
  branch
}) => String(semester) === '9' && branch === 'MCA' && allowedSubjects.includes(subject);
export const listStudents = send(async (req, res) => {
  const users = await User.find({
    role: 'student',
    semester: '9',
    branch: 'MCA'
  }).select('-password').sort({
    name: 1
  });
  res.json({
    success: true,
    data: users
  });
});
export const getStudent = send(async (req, res) => {
  if (req.user.role === 'student' && req.user.id !== req.params.id) return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
  if (!validId(req.params.id)) return res.status(400).json({
    success: false,
    message: 'Invalid student ID'
  });
  const u = await User.findOne({
    _id: req.params.id,
    role: 'student',
    semester: '9',
    branch: 'MCA'
  }).select('-password');
  if (!u) return res.status(404).json({
    success: false,
    message: 'Student not found'
  });
  res.json({
    success: true,
    data: u
  });
});
export const addStudent = send(async (req, res) => {
  const {
    name,
    email,
    password,
    studentId
  } = req.body;
  const semester = '9',
    branch = 'MCA';
  if (!name || !email || !password || !studentId) return res.status(400).json({
    success: false,
    message: 'All fields are required'
  });
  const u = await User.create({
    name,
    email,
    password: await (await import('bcryptjs')).default.hash(password, 10),
    studentId,
    semester,
    branch,
    role: 'student'
  });
  const assigned = await Practical.find({
    semester,
    branch
  });
  if (assigned.length) await Progress.insertMany(assigned.map(p => ({
    student: u._id,
    practical: p._id,
    status: 'pending'
  })));
  res.status(201).json({
    success: true,
    data: {
      _id: u._id,
      name: u.name,
      email: u.email,
      studentId: u.studentId,
      semester: u.semester,
      branch: u.branch,
      role: u.role
    }
  });
});
export const deleteStudent = send(async (req, res) => {
  const student = await User.findOneAndDelete({
    _id: req.params.id,
    role: 'student',
    semester: '9',
    branch: 'MCA'
  });
  if (!student) return res.status(404).json({
    success: false,
    message: 'Student not found'
  });
  await Attendance.deleteMany({
    student: req.params.id
  });
  await Progress.deleteMany({
    student: req.params.id
  });
  res.json({
    success: true,
    message: 'Student deleted'
  });
});
export const listLabs = send(async (req, res) => {
  const filter = {
    semester: '9',
    branch: 'MCA',
    subject: {
      $in: allowedSubjects
    }
  };
  res.json({
    success: true,
    data: await Lab.find(filter).sort({
      date: -1
    })
  });
});
export const getLab = send(async (req, res) => {
  const item = await Lab.findById(req.params.id);
  if (!item || !isInLabScope(item)) return res.status(404).json({
    success: false,
    message: 'Lab not found'
  });
  res.json({
    success: true,
    data: item
  });
});
export const createLab = send(async (req, res) => {
  if (!isInLabScope({
    ...req.body,
    branch: 'MCA'
  })) return res.status(400).json({
    success: false,
    message: 'Labs are limited to semester 9 OOAD and MM subjects'
  });
  res.status(201).json({
    success: true,
    data: await Lab.create({
      ...req.body,
      semester: '9',
      branch: 'MCA'
    })
  });
});
export const updateLab = send(async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab || !isInLabScope(lab)) return res.status(404).json({
    success: false,
    message: 'Lab not found'
  });
  const updated = {
    ...lab.toObject(),
    ...req.body,
    semester: '9',
    branch: 'MCA'
  };
  if (!isInLabScope(updated)) return res.status(400).json({
    success: false,
    message: 'Labs are limited to semester 9 OOAD and MM subjects'
  });
  const d = await Lab.findByIdAndUpdate(req.params.id, {
    ...req.body,
    semester: '9',
    branch: 'MCA'
  }, {
    new: true,
    runValidators: true
  });
  res.json({
    success: true,
    data: d
  });
});
export const deleteLab = send(async (req, res) => {
  const lab = await Lab.findOneAndDelete({
    _id: req.params.id,
    semester: '9',
    branch: 'MCA',
    subject: {
      $in: allowedSubjects
    }
  });
  if (!lab) return res.status(404).json({
    success: false,
    message: 'Lab not found'
  });
  await Attendance.deleteMany({
    lab: req.params.id
  });
  res.json({
    success: true,
    message: 'Lab deleted'
  });
});
export const attendanceStudent = send(async (req, res) => {
  const id = req.params.studentId;
  if (req.user.role === 'student' && req.user.id !== id) return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
  res.json({
    success: true,
    data: await Attendance.find({
      student: id
    }).populate('lab').sort({
      date: -1
    })
  });
});
export const attendanceLab = send(async (req, res) => {
  const lab = await Lab.findById(req.params.labId);
  if (!lab || !isInLabScope(lab)) return res.status(404).json({
    success: false,
    message: 'Lab not found'
  });
  res.json({
    success: true,
    data: await Attendance.find({
      lab: req.params.labId
    }).populate('student', 'name studentId')
  });
});
export const saveAttendance = send(async (req, res) => {
  const {
    lab,
    records
  } = req.body;
  if (!lab || !Array.isArray(records)) return res.status(400).json({
    success: false,
    message: 'Lab and attendance records are required'
  });
  const labDoc = await Lab.findById(lab);
  if (!labDoc || !isInLabScope(labDoc)) return res.status(404).json({
    success: false,
    message: 'Lab not found'
  });
  const studentIds = [...new Set(records.map(record => String(record.student)))];
  const validStudents = await User.countDocuments({
    _id: {
      $in: studentIds
    },
    role: 'student',
    semester: '9',
    branch: 'MCA'
  });
  if (validStudents !== studentIds.length) return res.status(404).json({
    success: false,
    message: 'One or more semester 9 students were not found'
  });
  const data = await Promise.all(records.map(record => Attendance.findOneAndUpdate({
    student: record.student,
    lab
  }, {
    student: record.student,
    lab,
    status: record.status,
    date: labDoc.date
  }, {
    upsert: true,
    new: true,
    runValidators: true
  })));
  res.json({
    success: true,
    data
  });
});
export const updateAttendance = send(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) return res.status(404).json({
    success: false,
    message: 'Attendance record not found'
  });
  const lab = await Lab.findById(attendance.lab);
  if (!lab || !isInLabScope(lab)) return res.status(404).json({
    success: false,
    message: 'Attendance record not found'
  });
  attendance.status = req.body.status;
  if (!['present', 'absent'].includes(attendance.status)) return res.status(400).json({
    success: false,
    message: 'Invalid attendance status'
  });
  await attendance.save();
  res.json({
    success: true,
    data: attendance
  });
});
export const listPracticals = send(async (req, res) => {
  const filter = {
    semester: '9',
    branch: 'MCA',
    subject: {
      $in: allowedSubjects
    }
  };
  if (req.user.role === 'student') filter.branch = req.user.branch;
  res.json({
    success: true,
    data: await Practical.find(filter).sort({
      deadline: 1
    })
  });
});
export const getPractical = send(async (req, res) => {
  const d = await Practical.findById(req.params.id);
  if (!d || !isInLabScope(d)) return res.status(404).json({
    success: false,
    message: 'Practical not found'
  });
  res.json({
    success: true,
    data: d
  });
});
export const createPractical = send(async (req, res) => {
  if (!isInLabScope({
    ...req.body,
    branch: 'MCA'
  })) return res.status(400).json({
    success: false,
    message: 'Practicals are limited to semester 9 OOAD and MM subjects'
  });
  const practical = await Practical.create({
    ...req.body,
    semester: '9',
    branch: 'MCA',
    createdBy: req.user._id
  });
  const students = await User.find({
    role: 'student',
    semester: '9',
    branch: 'MCA'
  }).select('_id');
  if (students.length) await Progress.insertMany(students.map(s => ({
    student: s._id,
    practical: practical._id,
    status: 'pending'
  })));
  res.status(201).json({
    success: true,
    data: practical
  });
});
export const updatePractical = send(async (req, res) => {
  const practical = await Practical.findById(req.params.id);
  if (!practical) return res.status(404).json({
    success: false,
    message: 'Practical not found'
  });
  const updated = {
    ...practical.toObject(),
    ...req.body,
    semester: '9'
  };
  if (!isInLabScope(updated)) return res.status(400).json({
    success: false,
    message: 'Practicals are limited to semester 9 OOAD and MM subjects'
  });
  res.json({
    success: true,
    data: await Practical.findByIdAndUpdate(req.params.id, {
      ...req.body,
      semester: '9'
    }, {
      new: true,
      runValidators: true
    })
  });
});
export const deletePractical = send(async (req, res) => {
  const practical = await Practical.findOneAndDelete({
    _id: req.params.id,
    semester: '9',
    branch: 'MCA',
    subject: {
      $in: allowedSubjects
    }
  });
  if (!practical) return res.status(404).json({
    success: false,
    message: 'Practical not found'
  });
  await Progress.deleteMany({
    practical: req.params.id
  });
  res.json({
    success: true,
    message: 'Practical deleted'
  });
});
export const studentProgress = send(async (req, res) => {
  const id = req.params.studentId;
  if (req.user.role === 'student' && req.user.id !== id) return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
  res.json({
    success: true,
    data: await Progress.find({
      student: id
    }).populate('practical').sort({
      createdAt: -1
    })
  });
});
export const saveProgress = send(async (req, res) => {
  const {
    student,
    practical,
    status
  } = req.body;
  if (req.user.role === 'student' && String(req.user._id) !== String(student)) return res.status(403).json({
    success: false,
    message: 'You can only update your own progress'
  });
  if (!['pending', 'in-progress', 'completed'].includes(status)) return res.status(400).json({
    success: false,
    message: 'Invalid status'
  });
  const [studentDoc, practicalDoc] = await Promise.all([User.findOne({
    _id: student,
    role: 'student',
    semester: '9',
    branch: 'MCA'
  }), Practical.findById(practical)]);
  if (!studentDoc || !practicalDoc || !isInLabScope(practicalDoc)) return res.status(404).json({
    success: false,
    message: 'Student or practical not found'
  });
  if (studentDoc.semester !== practicalDoc.semester || studentDoc.branch !== practicalDoc.branch) return res.status(403).json({
    success: false,
    message: 'This practical is not assigned to the student'
  });
  const d = await Progress.findOneAndUpdate({
    student,
    practical
  }, {
    student,
    practical,
    status,
    submissionDate: status === 'completed' ? new Date().toISOString().slice(0, 10) : null
  }, {
    upsert: true,
    new: true,
    runValidators: true
  });
  res.json({
    success: true,
    data: d
  });
});
export const updateProgress = send(async (req, res) => {
  const p = await Progress.findById(req.params.id);
  if (!p) return res.status(404).json({
    success: false,
    message: 'Progress not found'
  });
  if (req.user.role === 'student' && String(p.student) !== String(req.user._id)) return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
  p.status = req.body.status;
  if (!['pending', 'in-progress', 'completed'].includes(p.status)) return res.status(400).json({
    success: false,
    message: 'Invalid status'
  });
  p.submissionDate = p.status === 'completed' ? new Date().toISOString().slice(0, 10) : null;
  await p.save();
  res.json({
    success: true,
    data: p
  });
});
async function statsFor(id) {
  const student = id ? {
    student: id
  } : {};
  const [labs, present, absent, practicals, progress] = await Promise.all([Attendance.countDocuments(student), Attendance.countDocuments({
    ...student,
    status: 'present'
  }), Attendance.countDocuments({
    ...student,
    status: 'absent'
  }), Practical.countDocuments(), Progress.aggregate([{
    $match: id ? {
      student: new mongoose.Types.ObjectId(id)
    } : {}
  }, {
    $group: {
      _id: '$status',
      count: {
        $sum: 1
      }
    }
  }])]);
  const counts = {
    'completed': 0,
    'pending': 0,
    'in-progress': 0
  };
  progress.forEach(x => counts[x._id] = x.count);
  const totalProgress = Object.values(counts).reduce((a, b) => a + b, 0);
  const attendancePercentage = labs ? Math.round(present / labs * 100) : 0;
  const practicalCompletionPercentage = totalProgress ? Math.round(counts.completed / totalProgress * 100) : 0;
  return {
    totalLabSessions: labs,
    presentSessions: present,
    absentSessions: absent,
    attendancePercentage,
    totalPracticals: totalProgress,
    completedPracticals: counts.completed,
    pendingPracticals: counts.pending,
    inProgressPracticals: counts['in-progress'],
    practicalCompletionPercentage,
    overallProgress: Math.round((attendancePercentage + practicalCompletionPercentage) / 2)
  };
}
export const studentAnalytics = send(async (req, res) => {
  const id = req.params.studentId;
  if (req.user.role === 'student' && req.user.id !== id) return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
  res.json({
    success: true,
    data: await statsFor(id)
  });
});
export const overview = send(async (req, res) => {
  const scope = {
    semester: '9',
    branch: 'MCA',
    subject: {
      $in: allowedSubjects
    }
  };
  const scopedLabs = await Lab.find(scope).select('_id');
  const labIds = scopedLabs.map(lab => lab._id);
  const [students, totalLabSessions, allAtt, practicals, progress] = await Promise.all([User.countDocuments({
    role: 'student',
    semester: '9',
    branch: 'MCA'
  }), Lab.countDocuments(scope), Attendance.find({
    lab: {
      $in: labIds
    }
  }), Practical.countDocuments(scope), Progress.aggregate([{
    $match: {
      practical: {
        $in: await Practical.find(scope).distinct('_id')
      }
    }
  }, {
    $group: {
      _id: '$status',
      count: {
        $sum: 1
      }
    }
  }])]);
  const totals = {
    completed: 0,
    pending: 0,
    'in-progress': 0
  };
  progress.forEach(x => totals[x._id] = x.count);
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  res.json({
    success: true,
    data: {
      totalStudents: students,
      totalLabSessions,
      averageAttendance: allAtt.length ? Math.round(allAtt.filter(a => a.status === 'present').length / allAtt.length * 100) : 0,
      totalPracticals: practicals,
      practicalCompletion: total ? Math.round(totals.completed / total * 100) : 0,
      attendance: {
        present: allAtt.filter(a => a.status === 'present').length,
        absent: allAtt.filter(a => a.status === 'absent').length
      },
      practicalsByStatus: {
        completed: totals.completed,
        pending: totals.pending,
        inProgress: totals['in-progress']
      },
      recentStudents: await User.find({
        role: 'student',
        semester: '9',
        branch: 'MCA'
      }).select('name studentId branch semester').sort({
        createdAt: -1
      }).limit(5),
      recentLabs: await Lab.find(scope).sort({
        createdAt: -1
      }).limit(5)
    }
  });
});
