import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  facultyid: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    trim: true
  },
  fullname: {
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
    required: true
  },
  birthdate: {
    type: Date,
    required: true
  },
  program: {
    type: String,
    enum: ['BSIT', 'BSCS'],
    required: true
  },
  position: {
    type: String,
    enum: ['IT Professor', 'CS Professor'],
    required: true
  },
  role: {
    type: String,
    enum: ['faculty', 'faculty_admin'],
    default: 'faculty'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  strict: false,
  collection: 'faculty'
});

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;
