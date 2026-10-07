import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  },
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});
schema.index({
  student: 1,
  lab: 1
}, {
  unique: true
});
export default mongoose.model('Attendance', schema);
