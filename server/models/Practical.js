import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
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
  deadline: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});
export default mongoose.model('Practical', schema);
