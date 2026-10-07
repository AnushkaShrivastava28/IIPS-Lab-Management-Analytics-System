import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  practical: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practical',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  submissionDate: {
    type: String,
    default: null
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});
schema.index({
  student: 1,
  practical: 1
}, {
  unique: true
});
export default mongoose.model('Progress', schema);
