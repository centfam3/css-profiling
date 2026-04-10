import mongoose from 'mongoose';

// Event schema with proper defaults
const eventSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    default: ''
  },
  participants: {
    type: [String],
    default: []
  },
  maxParticipants: {
    type: Number,
    default: 50
  }
}, { 
  strict: false,
  collection: 'events'
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
