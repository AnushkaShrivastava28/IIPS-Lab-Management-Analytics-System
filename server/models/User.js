import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    sparse: true,
    unique: true
  },
  semester: {
    type: String
  },
  branch: {
    type: String
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});
userSchema.pre('validate', function () {
  if (this.role === 'student' && !this.studentId) this.invalidate('studentId', 'Student ID is required');
});
export default mongoose.model('User', userSchema);
