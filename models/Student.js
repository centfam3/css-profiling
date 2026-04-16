import mongoose from 'mongoose';

// Ultra-flexible schema - accepts ANY data structure
const studentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    sparse: false,  // Ensure unique constraint works properly
    trim: true
  },
  // Explicitly define achievements array so it's included in toJSON()
  achievements: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
}, { 
  strict: false,
  collection: 'students'
});

const Student = mongoose.model('Student', studentSchema);
export default Student;



