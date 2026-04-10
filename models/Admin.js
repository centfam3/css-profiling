import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
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
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'admins'
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
