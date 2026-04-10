import mongoose from 'mongoose';

// Ultra-flexible schema - accepts ANY data structure
const announcementSchema = new mongoose.Schema({}, { 
  strict: false,
  collection: 'announcements'
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
