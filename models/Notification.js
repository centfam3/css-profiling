import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student', 'all'],
    default: 'all'
  },
  type: {
    type: String,
    default: 'Info'
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
