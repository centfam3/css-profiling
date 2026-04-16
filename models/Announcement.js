import mongoose from 'mongoose';

// Ultra-flexible schema - accepts ANY data structure
const announcementSchema = new mongoose.Schema({
  // Explicitly define id field so it's included in JSON responses
  id: {
    type: String,
    unique: true,
    sparse: true
  }
}, { 
  strict: false,
  collection: 'announcements'
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
