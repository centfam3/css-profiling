import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Student from './models/Student.js';
import Event from './models/Event.js';
import Announcement from './models/Announcement.js';
import Admin from './models/Admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a log file
const logFile = path.join(__dirname, 'server.log');

function logError(msg) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}\n`;
  console.log(logMsg); // Also log to console
  try {
    fs.appendFileSync(logFile, logMsg);
  } catch (e) {
    // Ignore file write errors
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Connect to MongoDB
await connectDB();

// Cleanup database on startup - remove null IDs and fix indexes
try {
  console.log('🧹 Starting database cleanup...');
  
  // Remove documents with null or missing id
  const result = await Student.deleteMany({ 
    $or: [
      { id: null },
      { id: undefined },
      { id: '' },
      { id: { $exists: false } }
    ]
  });
  
  if (result.deletedCount > 0) {
    console.log(`✓ Cleaned up ${result.deletedCount} corrupted student records`);
  }

  // Clean up duplicate or empty emails
  const emailResult = await Student.deleteMany({
    $or: [
      { 'personalInfo.email': null },
      { 'personalInfo.email': '' },
      { 'personalInfo.email': { $exists: false } }
    ]
  });
  
  if (emailResult.deletedCount > 0) {
    console.log(`✓ Cleaned up ${emailResult.deletedCount} records with missing emails`);
  }
  
  // Drop ALL problematic indexes
  try {
    const indexes = await Student.collection.getIndexes();
    console.log('📋 Existing indexes:', Object.keys(indexes));
    
    // Drop all indexes except _id
    for (const indexName of Object.keys(indexes)) {
      if (indexName !== '_id_') {
        try {
          await Student.collection.dropIndex(indexName);
          console.log(`✓ Dropped index: ${indexName}`);
        } catch (e) {
          // Already dropped or doesn't exist
        }
      }
    }
  } catch (e) {
    console.warn('⚠ Could not list indexes:', e.message);
  }
  
  // Create only the ID unique index (NO email index)
  await Student.collection.createIndex({ id: 1 }, { unique: true, sparse: true });
  console.log('✓ Database cleanup complete');
} catch (error) {
  console.error('⚠ Database cleanup error (non-critical):', error.message);
}

// Seed admin user if not exists
try {
  console.log('👤 Checking admin user...');
  const existingAdmin = await Admin.findOne({ email: 'admin@pnc.edu' });
  
  if (!existingAdmin) {
    const newAdmin = new Admin({
      id: 'ADMIN001',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@pnc.edu',
      password: 'admin123',
      role: 'admin'
    });
    
    await newAdmin.save();
    console.log('✓ Admin user created: admin@pnc.edu');
  } else {
    console.log('✓ Admin user already exists');
  }
} catch (error) {
  console.error('⚠ Admin seeding error:', error.message);
}

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(UPLOADS_DIR));

app.use(cors());
app.use(express.json());

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('📦 Body:', JSON.stringify(req.body).substring(0, 500));
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔴 GLOBAL ERROR:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// ========== ANNOUNCEMENT ENDPOINTS (TOP PRIORITY) ==========

// GET /api/announcements - Get all
app.get('/api/announcements', async (req, res) => {
  try {
    console.log('[API] GET /api/announcements');
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/announcements - Create
app.post('/api/announcements', async (req, res) => {
  try {
    console.log('[API] POST /api/announcements:', req.body);
    
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const newAnnouncement = new Announcement({
      id: `ANN${Date.now()}`,
      title: req.body.title,
      content: req.body.content,
      category: req.body.category || 'General',
      date: req.body.date || new Date(),
      status: req.body.status || 'Published',
      targetAudience: req.body.targetAudience || 'All Students',
      priority: req.body.priority || 'Normal',
      author: req.body.author || 'System Administrator'
    });
    
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/announcements/:id - Update
app.put('/api/announcements/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`[API] PUT /api/announcements/${id}:`, req.body);
    
    const updatedAnnouncement = await Announcement.findOneAndUpdate(
      { id: id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (updatedAnnouncement) {
      res.json(updatedAnnouncement);
    } else {
      console.log(`[API Error] Announcement ${id} not found`);
      res.status(404).json({ message: `Announcement ${id} not found` });
    }
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/announcements/:id - Delete
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`[API] DELETE /api/announcements/${id}`);
    
    const result = await Announcement.findOneAndDelete({ id: id });
    
    if (result) {
      res.json({ message: 'Announcement deleted' });
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== AUTH & STUDENT ENDPOINTS ==========

// POST /api/login - Unified login for Admin and Student
app.post('/api/login', async (req, res) => {
  try {
    console.log(`Login attempt: ${req.body.email}`);
    const { email, password } = req.body;

    // 1. Check if it's an Admin in the database
    const admin = await Admin.findOne({ email });
    if (admin && admin.password === password) {
      // Don't send password back
      const adminData = admin.toObject();
      delete adminData.password;
      return res.json({
        success: true,
        role: 'admin',
        user: adminData
      });
    }

    // 2. Check if it's a Student (using email or id as username)
    const student = await Student.findOne({
      $or: [
        { 'personalInfo.email': email },
        { id: email }
      ]
    });

    if (student && student.password === password) {
      // Don't send password back
      const studentData = student.toObject();
      delete studentData.password;
      return res.json({
        success: true,
        role: 'student',
        user: studentData
      });
    }

    // 3. Fail - invalid credentials
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/students - Get all with filtering
app.get('/api/students', async (req, res) => {
  try {
    const { skill, activity, studentId, minGpa } = req.query;
    let query = {};

    if (skill) {
      const searchSkill = skill.trim().toLowerCase();
      query.skills = { $elemMatch: { $regex: searchSkill, $options: 'i' } };
    }
    if (activity) {
      const searchActivity = activity.trim().toLowerCase();
      query.nonAcademicActivities = { $elemMatch: { name: { $regex: searchActivity, $options: 'i' } } };
    }
    if (studentId) {
      const searchId = studentId.toString().trim().toLowerCase();
      console.log(`[Backend Filter] Looking for Student ID: "${searchId}"`);
      query.id = { $regex: `^${searchId}$`, $options: 'i' };
    }
    if (minGpa) {
      query['academicHistory.gpa'] = { $gte: parseFloat(minGpa) };
    }

    const students = await Student.find(query);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/students/:id - Get one
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.params.id });
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/students - Create
app.post('/api/students', async (req, res) => {
  logError('========== NEW STUDENT REQUEST ==========');
  logError(`Body: ${JSON.stringify(req.body).substring(0, 1000)}`);
  
  try {
    logError('Step 1: Checking required fields...');
    
    if (!req.body.firstName || !req.body.lastName) {
      logError('FAIL: Missing firstName or lastName');
      return res.status(400).json({ message: 'First name and last name are required' });
    }
    
    if (!req.body.password) {
      logError('FAIL: Missing password');
      return res.status(400).json({ message: 'Password is required' });
    }
    
    const newId = req.body.id || `s${Date.now()}`;
    logError(`Step 2: Using ID: ${newId}`);
    
    logError('Step 3: Checking for duplicate ID...');
    const existingStudent = await Student.findOne({ id: newId });
    if (existingStudent) {
      logError(`FAIL: Duplicate ID ${newId}`);
      return res.status(400).json({ message: `Student ID "${newId}" already exists` });
    }
    
    logError('Step 4: Creating student object...');
    const studentData = {
      ...req.body,
      id: newId
    };
    
    logError(`Step 5: Creating model instance...`);
    const newStudent = new Student(studentData);
    logError('Model instance created successfully');
    
    logError('Step 6: Calling save()...');
    const result = await newStudent.save();
    logError('Step 7: Save completed successfully!');
    logError(`Saved ID: ${result._id}`);
    
    res.status(201).json(result);
    logError('========== REQUEST COMPLETE ==========\n');
    
  } catch (error) {
    logError('❌ ERROR CAUGHT ❌');
    logError(`Message: ${error.message}`);
    logError(`Name: ${error.name}`);
    logError(`Code: ${error.code}`);
    logError(`Full stack: ${error.stack}`);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.toString()
    });
    logError('========== REQUEST COMPLETE (ERROR) ==========\n');
  }
});

app.post('/api/students/:id/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const studentId = req.params.id;
    const photo = req.file.filename;

    const student = await Student.findOneAndUpdate(
      { id: studentId },
      { photo: photo },
      { new: true }
    );

    if (student) {
      res.json({ photo });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/students/:id/upload-medical', upload.single('medicalCert'), async (req, res) => {
  try {
    const studentId = req.params.id;
    const medicalCert = req.file.filename;

    const student = await Student.findOneAndUpdate(
      { id: studentId },
      { medicalCert: medicalCert },
      { new: true }
    );

    if (student) {
      res.json({ medicalCert });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error uploading medical certificate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/students/:id - Update full
app.put('/api/students/:id', async (req, res) => {
  try {
    const oldId = req.params.id;
    const newStudentData = req.body;
    const newId = newStudentData.id;

    console.log(`[Update] Old ID: ${oldId}, New ID: ${newId}`);
    
    // 1. Validation for duplicate ID (only if ID is changed)
    if (newId && newId !== oldId) {
      const exists = await Student.findOne({ id: newId });
      if (exists) {
        console.log(`[Error] New ID ${newId} already exists`);
        return res.status(400).json({ message: `Student ID "${newId}" already exists` });
      }
    }

    // 2. Update student data
    const updatedStudent = await Student.findOneAndUpdate(
      { id: oldId },
      { ...newStudentData, updatedAt: new Date() },
      { new: true }
    );

    if (updatedStudent) {
      // 3. Propagate ID change to events (if applicable)
      if (newId && newId !== oldId) {
        console.log(`[Update] Propagating ID change to events...`);
        await Event.updateMany(
          { participants: oldId },
          { $set: { 'participants.$': newId } }
        );
      }

      console.log(`[Success] Student ${oldId} updated to ${updatedStudent.id}`);
      res.json(updatedStudent);
    } else {
      console.log(`[Error] Student ${oldId} not found`);
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id - Delete
app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Delete the student
    await Student.findOneAndDelete({ id: studentId });

    // Remove student from all event participants lists
    await Event.updateMany(
      { participants: studentId },
      { $pull: { participants: studentId } }
    );

    res.json({ message: 'Student deleted and removed from all events' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id/academic/:index
app.delete('/api/students/:id/academic/:index', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.id },
      { $unset: { [`academicHistory.${req.params.index}`]: 1 } },
      { new: true }
    );
    
    if (student) {
      // Remove null entries
      student.academicHistory = student.academicHistory.filter(h => h !== null);
      await student.save();
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error deleting academic history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id/activity/:index
app.delete('/api/students/:id/activity/:index', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.id },
      { $unset: { [`nonAcademicActivities.${req.params.index}`]: 1 } },
      { new: true }
    );
    
    if (student) {
      student.nonAcademicActivities = student.nonAcademicActivities.filter(a => a !== null);
      await student.save();
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id/violation/:index
app.delete('/api/students/:id/violation/:index', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.id },
      { $unset: { [`violations.${req.params.index}`]: 1 } },
      { new: true }
    );
    
    if (student) {
      student.violations = student.violations.filter(v => v !== null);
      await student.save();
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error deleting violation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id/affiliation/:index
app.delete('/api/students/:id/affiliation/:index', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.id },
      { $unset: { [`affiliations.${req.params.index}`]: 1 } },
      { new: true }
    );
    
    if (student) {
      student.affiliations = student.affiliations.filter(aff => aff !== null);
      await student.save();
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error deleting affiliation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id/skill/:skillName
app.delete('/api/students/:id/skill/:skillName', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.id },
      { $pull: { skills: req.params.skillName } },
      { new: true }
    );
    
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== EVENT ENDPOINTS ==========

// GET /api/events - Get all events
app.get('/api/events', async (req, res) => {
  try {
    let events = await Event.find().sort({ date: -1 });
    
    // Clean up orphaned participants (students that no longer exist)
    const students = await Student.find();
    const studentIds = new Set(students.map(s => s.id));

    const cleanedEvents = await Promise.all(
      events.map(async (event) => {
        // Ensure participants is always an array
        let participants = Array.isArray(event.participants) ? event.participants : [];
        const validParticipants = participants.filter(id => studentIds.has(id));
        
        if (validParticipants.length !== participants.length) {
          await Event.updateOne({ _id: event._id }, { participants: validParticipants });
        }
        
        // Return event with ensured participants array
        return {
          ...event.toObject(),
          participants: validParticipants
        };
      })
    );

    res.json(cleanedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/events/:id - Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.id });
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events - Create new event
app.post('/api/events', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.date || !req.body.time || !req.body.venue) {
      return res.status(400).json({ message: 'Event name, date, time, and venue are required' });
    }
    
    const newEvent = new Event({
      id: `EVT${Date.now()}`,
      title: req.body.name || req.body.title,
      description: req.body.description || '',
      date: req.body.date,
      time: req.body.time,
      endDate: req.body.endDate || req.body.date,
      endTime: req.body.endTime || req.body.time,
      location: req.body.venue || req.body.location,
      category: req.body.category || 'General',
      maxParticipants: req.body.maxParticipants || 50,
      participants: req.body.participants || [],
      status: 'Upcoming'
    });
    
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/events/:id - Update event
app.put('/api/events/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (updatedEvent) {
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/events/:id - Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const result = await Event.findOneAndDelete({ id: req.params.id });
    
    if (result) {
      res.json({ message: 'Event deleted' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/register - Student registers for event
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const event = await Event.findOne({ id: req.params.id });
    
    if (event) {
      // Check if already registered
      if (event.participants.includes(studentId)) {
        return res.status(400).json({ message: 'Student already registered for this event' });
      }
      
      // Check capacity
      if (event.participants.length >= event.maxParticipants) {
        return res.status(400).json({ message: 'Event is at maximum capacity' });
      }
      
      await Event.updateOne({ id: req.params.id }, { $push: { participants: studentId } });
      const updatedEvent = await Event.findOne({ id: req.params.id });
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/unregister - Student unregisters from event
app.post('/api/events/:id/unregister', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const updatedEvent = await Event.findOneAndUpdate(
      { id: req.params.id },
      { $pull: { participants: studentId } },
      { new: true }
    );
    
    if (updatedEvent) {
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== REPORTS ENDPOINTS ==========

// GET /api/reports/summary - Get summary of students per event
app.get('/api/reports/summary', async (req, res) => {
  try {
    const events = await Event.find();
    
    const summary = events.map(event => {
      const participantCount = (event.participants || []).length;
      return {
        eventId: event.id,
        eventName: event.title || event.name,
        eventDate: event.date,
        totalStudents: participantCount
      };
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
