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
import Faculty from './models/Faculty.js';
import Notification from './models/Notification.js';

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

// Helper to create notifications
async function createNotification({ userId, role, type, message, link }) {
  try {
    const notification = new Notification({
      userId,
      role,
      type,
      message,
      link,
      timestamp: new Date(),
      isRead: false
    });
    await notification.save();
    logError(`🔔 Notification created: ${message} (Role: ${role}, User: ${userId})`);
    return notification;
  } catch (error) {
    logError(`❌ Error creating notification: ${error.message}`);
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
  
  // ===== CLEAN UP ANNOUNCEMENTS =====
  try {
    // NOTE: Disabled aggressive cleanup that was deleting announcements
    // Announcements are properly created with id field, so we don't need to delete them
    
    // Drop ALL problematic indexes on Announcements
    try {
      const annIndexes = await Announcement.collection.getIndexes();
      console.log('📋 Announcement indexes:', Object.keys(annIndexes));
      
      // Drop all indexes except _id
      for (const indexName of Object.keys(annIndexes)) {
        if (indexName !== '_id_') {
          try {
            await Announcement.collection.dropIndex(indexName);
            console.log(`✓ Dropped announcement index: ${indexName}`);
          } catch (e) {
            // Already dropped or doesn't exist
          }
        }
      }
    } catch (e) {
      console.warn('⚠ Could not list announcement indexes:', e.message);
    }
    
  } catch (annError) {
    console.warn('⚠ Announcement cleanup error:', annError.message);
  }
  
  // ===== CLEAN UP STUDENTS =====
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

// ========== NOTIFICATION ENDPOINTS ==========

// GET /api/notifications - Get for user (ID or role)
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId, role } = req.query;
    let query = {};

    if (userId && role) {
      // 1. Notifications specifically for this user
      // 2. Notifications for this role that are NOT targeted to a specific user
      // 3. Notifications for everyone that are NOT targeted to a specific user
      query = {
        $or: [
          { userId: userId },
          { $and: [{ role: role }, { userId: null }] },
          { $and: [{ role: 'all' }, { userId: null }] }
        ]
      };
    } else if (userId) {
      query = { 
        $or: [
          { userId: userId }, 
          { $and: [{ role: 'all' }, { userId: null }] }
        ] 
      };
    } else if (role) {
      query = { 
        $or: [
          { role: role }, 
          { role: 'all' }
        ] 
      };
    }

    console.log(`[API] Fetching notifications for: userId=${userId}, role=${role}`);
    const notifications = await Notification.find(query).sort({ timestamp: -1 }).limit(50);
    console.log(`[API] Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    logError(`❌ Error fetching notifications: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/notifications - Create notification
app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, role, type, message, link } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const notification = await createNotification({ userId, role, type, message, link });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/notifications/:id/read - Mark single as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (notification) {
      res.json(notification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/notifications/read-all - Mark all as read for user/role
app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const { userId, role } = req.body;
    let query = {};
    if (userId && role) {
      query = { $or: [{ userId: userId }, { role: role }, { role: 'all' }] };
    } else if (userId) {
      query = { $or: [{ userId: userId }, { role: 'all' }] };
    } else if (role) {
      query = { $or: [{ role: role }, { role: 'all' }] };
    }
    
    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ANNOUNCEMENT ENDPOINTS (TOP PRIORITY) ==========

// GET /api/announcements - Get all
app.get('/api/announcements', async (req, res) => {
  try {
    console.log('[API] GET /api/announcements');
    const announcements = await Announcement.find().sort({ date: -1 });
    
    // Ensure all announcements have an 'id' field (fallback to _id if missing)
    const enrichedAnnouncements = announcements.map(ann => {
      const obj = ann.toObject();
      if (!obj.id) {
        obj.id = obj._id.toString();
      }
      return obj;
    });
    
    res.json(enrichedAnnouncements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/announcements - Create
app.post('/api/announcements', async (req, res) => {
  try {
    console.log('[API] POST /api/announcements - Body:', JSON.stringify(req.body, null, 2));
    
    const { title, content, category, date, status, targetAudience, priority, author } = req.body;
    
    if (!title || !content) {
      console.error('[API Error] Missing required fields: title or content', { title, content });
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    // Generate a truly unique ID using timestamp + random values
    const uniqueSuffix = Math.random().toString(36).substring(2, 9) + Date.now();
    const announcementId = `ANN${uniqueSuffix}`;
    
    const announcementData = {
      id: announcementId,
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      date: date ? new Date(date) : new Date(),
      status: status || 'Published',
      targetAudience: targetAudience || 'All Students',
      priority: priority || 'Normal',
      author: author || 'System Administrator',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('[API] Creating announcement with data:', announcementData);
    
    try {
      const newAnnouncement = new Announcement(announcementData);
      const savedAnnouncement = await newAnnouncement.save();
      
      // Notify Admin and Faculty about new announcement
      await createNotification({
        role: 'admin',
        type: 'Bullhorn',
        message: `New announcement: ${savedAnnouncement.title}`,
        link: `/dashboard/announcements`
      });
      await createNotification({
        role: 'faculty',
        type: 'Bullhorn',
        message: `New announcement: ${savedAnnouncement.title}`,
        link: `/dashboard/announcements`
      });

      console.log('[API] ✓ Announcement created successfully:', savedAnnouncement._id);
      res.status(201).json(savedAnnouncement);
    } catch (mongoError) {
      // If we get a duplicate key error on 'id', try one more time with a different ID
      if (mongoError.code === 11000 && mongoError.keyPattern?.id) {
        console.warn('[API] Duplicate key error for id, retrying with new ID...');
        
        const retryId = `ANN${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        announcementData.id = retryId;
        
        const retryAnnouncement = new Announcement(announcementData);
        const savedAnnouncement = await retryAnnouncement.save();
        
        console.log('[API] ✓ Announcement created successfully on retry:', savedAnnouncement._id);
        res.status(201).json(savedAnnouncement);
      } else {
        throw mongoError;
      }
    }
  } catch (error) {
    console.error('[API Error] Error creating announcement:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Server error creating announcement', 
      error: error.message,
      details: error.toString()
    });
  }
});

// PUT /api/announcements/:id - Update
app.put('/api/announcements/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`[API] PUT /api/announcements/${id}:`, req.body);
    
    const updateData = { ...req.body };
    
    // Convert date string to Date object if provided
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date);
    }
    
    // Remove publishDate and id/_id from update data (shouldn't be modified)
    delete updateData.publishDate;
    delete updateData.id;
    delete updateData._id;
    
    updateData.updatedAt = new Date();
    
    // Try finding by custom 'id' field first, then by MongoDB '_id'
    let updatedAnnouncement = await Announcement.findOneAndUpdate(
      { id: id },
      updateData,
      { returnDocument: 'after' }
    );
    
    // If not found by 'id', try by MongoDB '_id'
    if (!updatedAnnouncement) {
      try {
        updatedAnnouncement = await Announcement.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        );
      } catch (e) {
        // MongoDB ObjectId parsing error
        console.log(`[API Error] Could not find announcement by _id: ${id}`);
      }
    }
    
    if (updatedAnnouncement) {
      // Notify Admin and Faculty about announcement update
      await createNotification({
        role: 'admin',
        type: 'Edit',
        message: `Announcement updated: ${updatedAnnouncement.title}`,
        link: `/dashboard/announcements`
      });
      await createNotification({
        role: 'faculty',
        type: 'Edit',
        message: `Announcement updated: ${updatedAnnouncement.title}`,
        link: `/dashboard/announcements`
      });

      res.json(updatedAnnouncement);
    } else {
      console.log(`[API Error] Announcement ${id} not found by either 'id' or '_id'`);
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
    const announcement = await Announcement.findOne({ id: id }) || await Announcement.findById(id);
    const annTitle = announcement ? announcement.title : id;

    // Try finding by custom 'id' field first, then by MongoDB '_id'
    let result = await Announcement.findOneAndDelete({ id: id });
    
    // If not found by 'id', try by MongoDB '_id'
    if (!result) {
      try {
        result = await Announcement.findByIdAndDelete(id);
      } catch (e) {
        // MongoDB ObjectId parsing error
        console.log(`[API Error] Could not find announcement by _id: ${id}`);
      }
    }
    
    if (result) {
      // Notify Admin and Faculty about announcement deletion
      await createNotification({
        role: 'admin',
        type: 'Trash',
        message: `Announcement deleted: ${annTitle}`,
        link: `/dashboard/announcements`
      });
      await createNotification({
        role: 'faculty',
        type: 'Trash',
        message: `Announcement deleted: ${annTitle}`,
        link: `/dashboard/announcements`
      });
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

// POST /api/login - Unified login for Admin, Faculty and Student
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

    // 2. Check if it's Faculty (using email)
    const faculty = await Faculty.findOne({ email: email.toLowerCase() });
    if (faculty && faculty.password === password) {
      // Don't send password back
      const facultyData = faculty.toObject();
      delete facultyData.password;
      return res.json({
        success: true,
        role: facultyData.role || 'faculty',
        user: facultyData
      });
    }

    // 3. Check if it's a Student (using email or id as username)
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

    // 4. Fail - invalid credentials
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
      console.log('📖 Fetching student:', req.params.id);
      console.log('   Achievements:', student.achievements);
      console.log('   Full object has achievements?', 'achievements' in student);
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
      id: newId,
      achievements: req.body.achievements || []  // Ensure achievements is initialized
    };
    
    logError(`Step 5: Creating model instance...`);
    const newStudent = new Student(studentData);
    logError('Model instance created successfully');
    
    logError('Step 6: Calling save()...');
    const result = await newStudent.save();
    logError('Step 7: Save completed successfully!');
    logError(`Saved ID: ${result._id}`);
    
    // Notify Admin and Faculty about new student registration
    await createNotification({
      role: 'admin',
      type: 'UserPlus',
      message: `New student registered: ${result.firstName} ${result.lastName} (${result.id})`,
      link: `/dashboard/student-management`
    });
    await createNotification({
      role: 'faculty',
      type: 'UserPlus',
      message: `New student registered: ${result.firstName} ${result.lastName} (${result.id})`,
      link: `/dashboard/student-management`
    });
    
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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
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

      // Notify Admin and Faculty about student update
      await createNotification({
        role: 'admin',
        type: 'Edit',
        message: `Student updated: ${updatedStudent.firstName} ${updatedStudent.lastName} (${updatedStudent.id})`,
        link: `/dashboard/users/${updatedStudent.id}`
      });
      await createNotification({
        role: 'faculty',
        type: 'Edit',
        message: `Student updated: ${updatedStudent.firstName} ${updatedStudent.lastName} (${updatedStudent.id})`,
        link: `/dashboard/users/${updatedStudent.id}`
      });

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
    
    // Find student first to get their name for the notification
    const student = await Student.findOne({ id: studentId });
    const studentName = student ? `${student.firstName} ${student.lastName}` : studentId;

    // Delete the student
    await Student.findOneAndDelete({ id: studentId });

    // Remove student from all event participants lists
    await Event.updateMany(
      { participants: studentId },
      { $pull: { participants: studentId } }
    );

    // Notify Admin and Faculty about student deletion
    await createNotification({
      role: 'admin',
      type: 'Trash',
      message: `Student account deleted: ${studentName} (${studentId})`,
      link: `/dashboard/student-management`
    });
    await createNotification({
      role: 'faculty',
      type: 'Trash',
      message: `Student account deleted: ${studentName} (${studentId})`,
      link: `/dashboard/student-management`
    });

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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
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

// POST /api/students/:id/achievements - Add achievement to student
app.post('/api/students/:id/achievements', async (req, res) => {
  try {
    const { title, category, date, description, status } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    if (!['Academic', 'Sports'].includes(category)) {
      return res.status(400).json({ message: 'Category must be Academic or Sports' });
    }

    const student = await Student.findOne({ id: req.params.id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('📚 Adding achievement for student:', req.params.id);
    console.log('   Before - Achievements:', student.achievements);

    // Initialize achievements array if not exists
    if (!student.achievements) {
      student.achievements = [];
    }

    const newAchievement = {
      id: `ACH${Date.now()}`,
      title: title.trim(),
      category: category,
      date: date || new Date().toISOString().split('T')[0],
      description: description || '',
      status: status || 'approved'
    };

    student.achievements.push(newAchievement);
    console.log('   Before Save - Achievements:', student.achievements);
    
    const savedStudent = await student.save();
    
    // Notify the specific student about the new achievement
    await createNotification({
      userId: req.params.id,
      role: 'student',
      type: 'Trophy',
      message: `Congratulations! Your achievement "${newAchievement.title}" has been added.`,
      link: `/student-dashboard/achievements`
    });

    console.log('   After Save - Achievements:', savedStudent.achievements);
    console.log('   Full saved student object keys:', Object.keys(savedStudent.toObject ? savedStudent.toObject() : savedStudent));

    res.status(201).json(savedStudent);
  } catch (error) {
    console.error('❌ Error adding achievement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id/achievements/:achievementId - Delete achievement
app.delete('/api/students/:id/achievements/:achievementId', async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.params.id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.achievements) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    student.achievements = student.achievements.filter(a => a.id !== req.params.achievementId);
    await student.save();

    res.json(student);
  } catch (error) {
    console.error('Error deleting achievement:', error);
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
        let pendingRequests = Array.isArray(event.pendingRequests) ? event.pendingRequests : [];
        
        const validParticipants = participants.filter(id => studentIds.has(id));
        const validPendingRequests = pendingRequests.filter(id => studentIds.has(id));
        
        if (validParticipants.length !== participants.length || validPendingRequests.length !== pendingRequests.length) {
          await Event.updateOne({ _id: event._id }, { participants: validParticipants, pendingRequests: validPendingRequests });
        }
        
        // Return event with ensured arrays
        return {
          ...event.toObject(),
          participants: validParticipants,
          pendingRequests: validPendingRequests
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
      name: req.body.name || req.body.title || '',
      title: req.body.name || req.body.title || '',
      description: req.body.description || '',
      date: req.body.date,
      time: req.body.time,
      endDate: req.body.endDate || req.body.date,
      endTime: req.body.endTime || req.body.time,
      venue: req.body.venue || req.body.location || '',
      location: req.body.venue || req.body.location || '',
      category: req.body.category || 'General',
      maxParticipants: req.body.maxParticipants || 50,
      participants: req.body.participants || [],
      status: 'Upcoming'
    });
    
    await newEvent.save();

    // Notify Admin and Faculty about new event creation
    await createNotification({
      role: 'admin',
      type: 'CalendarPlus',
      message: `New event created: ${newEvent.name}`,
      link: `/dashboard/event-management`
    });
    await createNotification({
      role: 'faculty',
      type: 'CalendarPlus',
      message: `New event created: ${newEvent.name}`,
      link: `/dashboard/event-management`
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/events/:id - Update event
app.put('/api/events/:id', async (req, res) => {
  try {
    console.log(`[API] PUT /api/events/${req.params.id}:`, req.body);
    
    const updatedEvent = await Event.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { returnDocument: 'after' }
    );
    
    if (updatedEvent) {
      console.log(`✓ Event updated:`, updatedEvent);

      // Notify Admin and Faculty about event update
      await createNotification({
        role: 'admin',
        type: 'Edit',
        message: `Event updated: ${updatedEvent.title || updatedEvent.name}`,
        link: `/dashboard/event-management`
      });
      await createNotification({
        role: 'faculty',
        type: 'Edit',
        message: `Event updated: ${updatedEvent.title || updatedEvent.name}`,
        link: `/dashboard/event-management`
      });

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
    const eventId = req.params.id;
    const event = await Event.findOne({ id: eventId });
    const eventName = event ? (event.title || event.name) : eventId;

    const result = await Event.findOneAndDelete({ id: eventId });
    
    if (result) {
      // Notify Admin and Faculty about event deletion
      await createNotification({
        role: 'admin',
        type: 'Trash',
        message: `Event deleted: ${eventName}`,
        link: `/dashboard/event-management`
      });
      await createNotification({
        role: 'faculty',
        type: 'Trash',
        message: `Event deleted: ${eventName}`,
        link: `/dashboard/event-management`
      });
      res.json({ message: 'Event deleted' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/assign - Admin directly assigns student to event (bypasses pending request)
app.post('/api/events/:id/assign', async (req, res) => {
  console.log('[ASSIGN] Event ID:', req.params.id);
  console.log('[ASSIGN] Student ID:', req.body.studentId);
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const event = await Event.findOne({ id: req.params.id });
    console.log('[ASSIGN] Event found:', !!event);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if already assigned
    if (event.participants.includes(studentId)) {
      return res.status(400).json({ message: 'Student already assigned to this event' });
    }
    
    // Check capacity
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is at maximum capacity' });
    }
    
    // Directly add to participants (admin assignment)
    await Event.updateOne(
      { id: req.params.id },
      { $push: { participants: studentId } }
    );

    // Notify the specific student about being assigned to an event
    await createNotification({
      userId: studentId,
      role: 'student',
      type: 'CalendarPlus',
      message: `You have been assigned to the event: ${event.title || event.name}`,
      link: `/student-dashboard/events`
    });

    const updatedEvent = await Event.findOne({ id: req.params.id });
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error assigning student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/request - Student requests to join event
app.post('/api/events/:id/request', async (req, res) => {
  console.log('[REQUEST] ====== REQUEST DEBUG ======');
  console.log('[REQUEST] Full URL:', req.originalUrl);
  console.log('[REQUEST] Params:', req.params);
  console.log('[REQUEST] Body:', req.body);
  console.log('[REQUEST] Headers:', req.headers);
  console.log('[REQUEST] Method:', req.method);
  console.log('[REQUEST] =============================');
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
      
      // Check if already has pending request
      if (event.pendingRequests?.includes(studentId)) {
        return res.status(400).json({ message: 'Request already pending for this event' });
      }
      
      // Check capacity
      if (event.participants.length >= event.maxParticipants) {
        return res.status(400).json({ message: 'Event is at maximum capacity' });
      }
      
      await Event.updateOne({ id: req.params.id }, { $push: { pendingRequests: studentId } });
      
      // Notify Admin and Faculty about the new request
      const student = await Student.findOne({ id: studentId });
      const studentName = student ? `${student.firstName} ${student.lastName}` : studentId;
      
      await createNotification({
        role: 'admin',
        type: 'Info',
        message: `New event join request from ${studentName} for event: ${event.title || event.name}`,
        link: `/dashboard/event-assignment`
      });
      await createNotification({
        role: 'faculty',
        type: 'Info',
        message: `New event join request from ${studentName} for event: ${event.title || event.name}`,
        link: `/dashboard/event-assignment`
      });

      const updatedEvent = await Event.findOne({ id: req.params.id });
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error requesting for event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/approve - Admin/Faculty approves a student request
app.post('/api/events/:id/approve', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const event = await Event.findOne({ id: req.params.id });
    
    if (event) {
      // Check if student is in pending requests
      if (!event.pendingRequests?.includes(studentId)) {
        return res.status(400).json({ message: 'No pending request found for this student' });
      }
      
      // Check if already registered
      if (event.participants.includes(studentId)) {
        return res.status(400).json({ message: 'Student already registered for this event' });
      }
      
      // Check capacity
      if (event.participants.length >= event.maxParticipants) {
        return res.status(400).json({ message: 'Event is at maximum capacity' });
      }
      
      // Remove from pending and add to participants
      await Event.updateOne(
        { id: req.params.id },
        { 
          $pull: { pendingRequests: studentId },
          $push: { participants: studentId }
        }
      );

      // Notify the student about the approval
      await createNotification({
        userId: studentId,
        role: 'student',
        type: 'CheckCircle',
        message: `Your request to join "${event.title || event.name}" has been approved!`,
        link: `/student-dashboard/events`
      });

      const updatedEvent = await Event.findOne({ id: req.params.id });
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events/:id/reject - Admin/Faculty rejects a student request
app.post('/api/events/:id/reject', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const event = await Event.findOne({ id: req.params.id });
    
    if (event) {
      // Remove from pending requests only
      await Event.updateOne(
        { id: req.params.id },
        { $pull: { pendingRequests: studentId } }
      );

      // Notify the student about the rejection
      await createNotification({
        userId: studentId,
        role: 'student',
        type: 'ExclamationCircle',
        message: `Your request to join "${event.title || event.name}" has been declined.`,
        link: `/student-dashboard/events`
      });

      const updatedEvent = await Event.findOne({ id: req.params.id });
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
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
      { returnDocument: 'after' }
    );
    
    if (updatedEvent) {
      // Notify Admin and Faculty about student unregistering
      const student = await Student.findOne({ id: studentId });
      const studentName = student ? `${student.firstName} ${student.lastName}` : studentId;
      
      await createNotification({
        role: 'admin',
        type: 'Info',
        message: `${studentName} unregistered from event: ${updatedEvent.title || updatedEvent.name}`,
        link: `/dashboard/event-assignment`
      });
      await createNotification({
        role: 'faculty',
        type: 'Info',
        message: `${studentName} unregistered from event: ${updatedEvent.title || updatedEvent.name}`,
        link: `/dashboard/event-assignment`
      });

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
        eventName: event.title || event.name || 'Untitled Event',
        eventDate: event.date || event.endDate || new Date().toISOString(),
        totalStudents: participantCount
      };
    });
    
    // Sort by date descending (newest first)
    summary.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== FACULTY ENDPOINTS ==========

// GET /api/faculty - Get all faculty
app.get('/api/faculty', async (req, res) => {
  try {
    console.log('[API] GET /api/faculty');
    const faculty = await Faculty.find().sort({ createdAt: -1 });
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/faculty/:id - Get single faculty
app.get('/api/faculty/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ facultyid: req.params.id });
    if (faculty) {
      res.json(faculty);
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/faculty - Create new faculty
app.post('/api/faculty', async (req, res) => {
  try {
    console.log('[API] POST /api/faculty:', req.body);
    
    // Validation
    const { facultyid, fullname, email, password, birthdate, program, position } = req.body;
    
    if (!facultyid || !fullname || !email || !password || !birthdate || !program || !position) {
      return res.status(400).json({ 
        message: 'All fields are required: facultyid, fullname, email, password, birthdate, program, position' 
      });
    }
    
    // Check duplicate faculty ID
    const existingFaculty = await Faculty.findOne({ facultyid });
    if (existingFaculty) {
      return res.status(400).json({ message: `Faculty ID "${facultyid}" already exists` });
    }
    
    // Check duplicate email
    const existingEmail = await Faculty.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: `Email "${email}" already exists` });
    }
    
    const newFaculty = new Faculty({
      facultyid,
      fullname,
      email: email.toLowerCase(),
      password,
      birthdate: new Date(birthdate),
      program,
      position
    });
    
    await newFaculty.save();

    // Notify Admin and Faculty about new faculty creation
    await createNotification({
      role: 'admin',
      type: 'UserPlus',
      message: `New faculty registered: ${newFaculty.fullname} (${newFaculty.facultyid})`,
      link: `/dashboard/faculty`
    });
    await createNotification({
      role: 'faculty',
      type: 'UserPlus',
      message: `New faculty registered: ${newFaculty.fullname} (${newFaculty.facultyid})`,
      link: `/dashboard/faculty`
    });

    res.status(201).json(newFaculty);
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/faculty/:id - Update faculty
app.put('/api/faculty/:id', async (req, res) => {
  try {
    const facultyId = req.params.id;
    console.log(`[API] PUT /api/faculty/${facultyId}:`, req.body);
    
    // Check if trying to change email to duplicate
    if (req.body.email) {
      const existingEmail = await Faculty.findOne({ 
        email: req.body.email.toLowerCase(),
        facultyid: { $ne: facultyId }
      });
      if (existingEmail) {
        return res.status(400).json({ message: `Email "${req.body.email}" already exists` });
      }
    }
    
    // Prepare update data
    const updateData = { ...req.body };
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }
    if (updateData.birthdate) {
      updateData.birthdate = new Date(updateData.birthdate);
    }
    updateData.updatedAt = new Date();
    
    // Try finding by facultyid first, then by MongoDB _id
    let updatedFaculty = await Faculty.findOneAndUpdate(
      { facultyid: facultyId },
      updateData,
      { returnDocument: 'after' }
    );
    
    // If not found by facultyid, try by _id
    if (!updatedFaculty) {
      try {
        updatedFaculty = await Faculty.findByIdAndUpdate(
          facultyId,
          updateData,
          { new: true }
        );
      } catch (e) {
        // MongoDB ObjectId parsing error
        console.log(`[API] Could not find faculty by _id: ${facultyId}`);
      }
    }
    
    if (updatedFaculty) {
      console.log(`[API] ✓ Faculty updated:`, updatedFaculty._id);

      // Notify Admin and Faculty about faculty update
      await createNotification({
        role: 'admin',
        type: 'Edit',
        message: `Faculty updated: ${updatedFaculty.fullname} (${updatedFaculty.facultyid})`,
        link: `/dashboard/faculty`
      });
      await createNotification({
        role: 'faculty',
        type: 'Edit',
        message: `Faculty updated: ${updatedFaculty.fullname} (${updatedFaculty.facultyid})`,
        link: `/dashboard/faculty`
      });

      res.json(updatedFaculty);
    } else {
      console.error(`[API] Faculty not found with id: ${facultyId}`);
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/faculty/:id - Delete faculty
app.delete('/api/faculty/:id', async (req, res) => {
  try {
    const facultyId = req.params.id;
    const faculty = await Faculty.findOne({ facultyid: facultyId });
    const facultyName = faculty ? faculty.fullname : facultyId;

    const result = await Faculty.findOneAndDelete({ facultyid: facultyId });
    
    if (result) {
      // Notify Admin and Faculty about faculty deletion
      await createNotification({
        role: 'admin',
        type: 'Trash',
        message: `Faculty deleted: ${facultyName} (${facultyId})`,
        link: `/dashboard/faculty`
      });
      await createNotification({
        role: 'faculty',
        type: 'Trash',
        message: `Faculty deleted: ${facultyName} (${facultyId})`,
        link: `/dashboard/faculty`
      });
      res.json({ message: 'Faculty deleted successfully' });
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Global error handler (Must be last)
app.use((err, req, res, next) => {
  console.error('🔴 GLOBAL ERROR:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
