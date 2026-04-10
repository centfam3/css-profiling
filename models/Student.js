import mongoose from 'mongoose';

// Ultra-flexible schema - accepts ANY data structure
const studentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    sparse: false,  // Ensure unique constraint works properly
    trim: true
  }
}, { 
  strict: false,
  collection: 'students'
});

// Drop the old index and create a proper one
studentSchema.index({ id: 1 }, { 
  unique: true,
  sparse: true,
  background: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;



