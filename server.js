import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const STUDENTS_FILE = path.join(__dirname, 'students.json');
const EVENTS_FILE = path.join(__dirname, 'events.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

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

// Helper to read students
const readStudents = () => {
  try {
    const data = fs.readFileSync(STUDENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper to write students
const writeStudents = (students) => {
  fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf8');
};

// Helper to read events
const readEvents = () => {
  try {
    const data = fs.readFileSync(EVENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper to write events
const writeEvents = (events) => {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
};

// POST /api/login - Unified login for Admin and Student
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const students = readStudents();

  // 1. Check if it's the Admin first
  if (email === 'admin@pnc.edu' && password === 'admin123') {
    return res.json({
      success: true,
      role: 'admin',
      user: { firstName: 'System', lastName: 'Administrator', email: 'admin@pnc.edu' }
    });
  }

  // 2. Check if it's a Student (using email or id as username)
  const student = students.find(s => 
    (s.personalInfo.email === email || s.id === email) && s.password === password
  );

  if (student) {
    const { password, ...studentData } = student; // Don't send password back
    return res.json({
      success: true,
      role: 'student',
      user: studentData
    });
  }

  // 3. Fail - invalid credentials
  res.status(401).json({ success: false, message: 'Invalid email or password' });
});

// GET /api/students - Get all with filtering
app.get('/api/students', (req, res) => {
  const { skill, activity, studentId, minGpa } = req.query;
  let students = readStudents();

  if (skill) {
    const searchSkill = skill.trim().toLowerCase();
    students = students.filter(s => 
      s.skills && s.skills.some(sk => {
        const skillName = typeof sk === 'string' ? sk : sk.name;
        // Use partial match (includes) for better UX
        return skillName && skillName.trim().toLowerCase().includes(searchSkill);
      })
    );
  }
  if (activity) {
    const searchActivity = activity.trim().toLowerCase();
    students = students.filter(s => 
      s.nonAcademicActivities && s.nonAcademicActivities.some(a => 
        a.name && a.name.trim().toLowerCase().includes(searchActivity)
      )
    );
  }
  if (studentId) {
    const searchId = studentId.toString().trim().toLowerCase();
    console.log(`[Backend Filter] Looking for Student ID: "${searchId}"`);
    students = students.filter(s => {
      const sId = (s.id || '').toString().trim().toLowerCase();
      const match = sId === searchId;
      if (match) console.log(`[Backend Filter] Match found: ${s.firstName} ${s.lastName} (${sId})`);
      return match;
    });
    console.log(`[Backend Filter] Students found after ID filter: ${students.length}`);
  }
  if (minGpa) {
    // Still check academicHistory for GPA
    students = students.filter(s => 
      s.academicHistory && s.academicHistory.some(h => parseFloat(h.gpa) >= parseFloat(minGpa))
    );
  }

  res.json(students);
});

// GET /api/students/:id - Get one
app.get('/api/students/:id', (req, res) => {
  const students = readStudents();
  const student = students.find(s => s.id === req.params.id);
  if (student) res.json(student);
  else res.status(404).json({ message: 'Student not found' });
});

// POST /api/students - Create
app.post('/api/students', (req, res) => {
  const students = readStudents();
  
  // Validate required fields
  if (!req.body.firstName || !req.body.lastName) {
    return res.status(400).json({ message: 'First name and last name are required' });
  }
  if (!req.body.personalInfo || !req.body.personalInfo.email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (!req.body.password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  // Use provided id, or generate one if not provided
  const newId = req.body.id && req.body.id.trim() ? req.body.id : `s${Date.now()}`;
  
  // Check if ID already exists
  if (students.some(s => s.id === newId)) {
    return res.status(400).json({ message: `Student ID "${newId}" already exists` });
  }
  
  const newStudent = { 
    ...req.body, 
    id: newId
  };
  
  students.push(newStudent);
  writeStudents(students);
  res.status(201).json(newStudent);
});

app.post('/api/students/:id/upload-photo', upload.single('photo'), (req, res) => {
  const studentId = req.params.id;
  const photo = req.file.filename;

  const students = readStudents();
  const index = students.findIndex(s => s.id === studentId);

  if (index !== -1) {
    students[index].photo = photo;
    writeStudents(students);
    res.json({ photo });
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

app.post('/api/students/:id/upload-medical', upload.single('medicalCert'), (req, res) => {
  const studentId = req.params.id;
  const medicalCert = req.file.filename;

  const students = readStudents();
  const index = students.findIndex(s => s.id === studentId);

  if (index !== -1) {
    students[index].medicalCert = medicalCert;
    writeStudents(students);
    res.json({ medicalCert });
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

// PUT /api/students/:id - Update full
app.put('/api/students/:id', (req, res) => {
  const oldId = req.params.id;
  const newStudentData = req.body;
  const newId = newStudentData.id;

  console.log(`[Update] Old ID: ${oldId}, New ID: ${newId}`);
  
  let students = readStudents();
  const index = students.findIndex(s => s.id === oldId);
  
  if (index !== -1) {
    // 1. Validation for duplicate ID (only if ID is changed)
    if (newId && newId !== oldId) {
      const exists = students.some(s => s.id !== oldId && s.id.toLowerCase() === newId.toLowerCase());
      if (exists) {
        console.log(`[Error] New ID ${newId} already exists`);
        return res.status(400).json({ message: `Student ID "${newId}" already exists` });
      }
    }

    // 2. Propagate ID change to events (if applicable)
    if (newId !== oldId) {
      console.log(`[Update] Propagating ID change to events...`);
      let events = readEvents();
      let eventsChanged = false;
      events = events.map(event => {
        if (event.participants && event.participants.includes(oldId)) {
          event.participants = event.participants.map(pid => pid === oldId ? newId : pid);
          eventsChanged = true;
        }
        return event;
      });
      if (eventsChanged) writeEvents(events);
    }

    // 3. Update student data and SAVE
    // Ensure ID is included in the saved data
    const updatedStudent = { ...newStudentData, id: newId || oldId };
    students[index] = updatedStudent;
    writeStudents(students);
    
    console.log(`[Success] Student ${oldId} updated to ${updatedStudent.id}`);
    res.json(updatedStudent);
  } else {
    console.log(`[Error] Student ${oldId} not found`);
    res.status(404).json({ message: 'Student not found' });
  }
});

// DELETE /api/students/:id - Delete
app.delete('/api/students/:id', (req, res) => {
  let students = readStudents();
  students = students.filter(s => s.id !== req.params.id);
  writeStudents(students);
  res.json({ message: 'Student deleted' });
});

// DELETE /api/students/:id/academic/:index
app.delete('/api/students/:id/academic/:index', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    students[index].academicHistory.splice(req.params.index, 1);
    writeStudents(students);
    res.json(students[index]);
  } else res.status(404).json({ message: 'Student not found' });
});

// DELETE /api/students/:id/activity/:index
app.delete('/api/students/:id/activity/:index', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    students[index].nonAcademicActivities.splice(req.params.index, 1);
    writeStudents(students);
    res.json(students[index]);
  } else res.status(404).json({ message: 'Student not found' });
});

// DELETE /api/students/:id/violation/:index
app.delete('/api/students/:id/violation/:index', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    students[index].violations.splice(req.params.index, 1);
    writeStudents(students);
    res.json(students[index]);
  } else res.status(404).json({ message: 'Student not found' });
});

// DELETE /api/students/:id/affiliation/:index
app.delete('/api/students/:id/affiliation/:index', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    students[index].affiliations.splice(req.params.index, 1);
    writeStudents(students);
    res.json(students[index]);
  } else res.status(404).json({ message: 'Student not found' });
});

// DELETE /api/students/:id/skill/:skillName
app.delete('/api/students/:id/skill/:skillName', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    students[index].skills = students[index].skills.filter(s => s !== req.params.skillName);
    writeStudents(students);
    res.json(students[index]);
  } else res.status(404).json({ message: 'Student not found' });
});

// ========== EVENT ENDPOINTS ==========

// GET /api/events - Get all events
app.get('/api/events', (req, res) => {
  const events = readEvents();
  res.json(events);
});

// GET /api/events/:id - Get single event
app.get('/api/events/:id', (req, res) => {
  const events = readEvents();
  const event = events.find(e => e.id === req.params.id);
  if (event) res.json(event);
  else res.status(404).json({ message: 'Event not found' });
});

// POST /api/events - Create new event
app.post('/api/events', (req, res) => {
  const events = readEvents();
  
  // Validate required fields
  if (!req.body.name || !req.body.date || !req.body.time || !req.body.venue) {
    return res.status(400).json({ message: 'Event name, date, time, and venue are required' });
  }
  
  const newEvent = {
    id: `EVT${Date.now()}`,
    name: req.body.name,
    date: req.body.date,
    time: req.body.time,
    endDate: req.body.endDate || req.body.date, // Default to start date if not provided
    endTime: req.body.endTime || req.body.time,   // Default to start time if not provided
    venue: req.body.venue,
    category: req.body.category || 'General',
    description: req.body.description || '',
    maxParticipants: req.body.maxParticipants || 50,
    participants: req.body.participants || [],
    createdAt: new Date().toISOString()
  };
  
  events.push(newEvent);
  writeEvents(events);
  res.status(201).json(newEvent);
});

// PUT /api/events/:id - Update event
app.put('/api/events/:id', (req, res) => {
  const events = readEvents();
  const index = events.findIndex(e => e.id === req.params.id);
  
  if (index !== -1) {
    const updatedEvent = {
      ...events[index],
      ...req.body,
      id: req.params.id // Keep original ID
    };
    events[index] = updatedEvent;
    writeEvents(events);
    res.json(updatedEvent);
  } else {
    res.status(404).json({ message: 'Event not found' });
  }
});

// DELETE /api/events/:id - Delete event
app.delete('/api/events/:id', (req, res) => {
  let events = readEvents();
  const originalLength = events.length;
  events = events.filter(e => e.id !== req.params.id);
  
  if (events.length < originalLength) {
    writeEvents(events);
    res.json({ message: 'Event deleted' });
  } else {
    res.status(404).json({ message: 'Event not found' });
  }
});

// POST /api/events/:id/register - Student registers for event
app.post('/api/events/:id/register', (req, res) => {
  const { studentId } = req.body;
  
  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }
  
  const events = readEvents();
  const eventIndex = events.findIndex(e => e.id === req.params.id);
  
  if (eventIndex !== -1) {
    const event = events[eventIndex];
    
    // Check if already registered
    if (event.participants.includes(studentId)) {
      return res.status(400).json({ message: 'Student already registered for this event' });
    }
    
    // Check capacity
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is at maximum capacity' });
    }
    
    event.participants.push(studentId);
    writeEvents(events);
    res.json(event);
  } else {
    res.status(404).json({ message: 'Event not found' });
  }
});

// POST /api/events/:id/unregister - Student unregisters from event
app.post('/api/events/:id/unregister', (req, res) => {
  const { studentId } = req.body;
  
  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }
  
  const events = readEvents();
  const eventIndex = events.findIndex(e => e.id === req.params.id);
  
  if (eventIndex !== -1) {
    const event = events[eventIndex];
    event.participants = event.participants.filter(id => id !== studentId);
    writeEvents(events);
    res.json(event);
  } else {
    res.status(404).json({ message: 'Event not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
