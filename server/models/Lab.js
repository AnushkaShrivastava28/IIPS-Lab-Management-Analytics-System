import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  labName: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['OOAD', 'MM']
  },
  semester: {
    type: String,
    required: true,
    enum: ['9']
  },
  branch: {
    type: String,
    required: true,
    enum: ['MCA']
  },
  faculty: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});
export default mongoose.model('Lab', schema);
