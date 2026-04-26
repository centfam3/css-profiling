import axios from 'axios';

const filipinoFirstNames = [
  'Jose', 'Maria', 'Juan', 'Rosa', 'Miguel', 'Ana', 'Carlos', 'Flores', 'Diego', 'Isabel',
  'Pedro', 'Carmen', 'Francisco', 'Dolores', 'Antonio', 'Mercedes',
];

const filipinoLastNames = [
  'Santos', 'Cruz', 'Garcia', 'Lopez', 'Reyes', 'Fernandez', 'Gonzales', 'Velasquez', 'Castillo', 'Morales',
  'Medina', 'Castro', 'Guerrero', 'Mercado', 'Vargas', 'Ramos',
];

const skills = [
  'magaling sa coding',
  'basketball',
  'volleyball',
  'programming',
  'web development',
  'design',
  'music',
  'dancing',
  'public speaking',
  'leadership',
];

const courses = [
  'BS Computer Science',
  'BS Information Technology',
  'BS Engineering',
  'BS Business Administration',
  'BS Education',
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomGPA() {
  return (Math.random() * 1.5 + 2.5).toFixed(2);
}

function generatePhilippinePhoneNumber() {
  // Philippines mobile format: 09XX XXX XXXX (11 digits)
  // Network prefixes for major carriers
  const networkPrefixes = ['905', '906', '907', '908', '909', '910', '911', '912'];
  const prefix = getRandomElement(networkPrefixes);
  const middleDigits = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  return `09${prefix}${middleDigits}`;
}

async function createBatch(startIndex, batchSize) {
  const promises = [];
  for (let i = startIndex; i < startIndex + batchSize && i < 1000; i++) {
    const firstName = getRandomElement(filipinoFirstNames);
    const lastName = getRandomElement(filipinoLastNames);
    // Format: 220001, 220002, ..., 221000
    const studentId = String(220000 + i + 1).padStart(6, '0');
    
    const studentSkills = [];
    const skillCount = Math.floor(Math.random() * 4) + 1;
    const skillSet = new Set();
    while (skillSet.size < skillCount) {
      skillSet.add(Math.floor(Math.random() * skills.length));
    }
    for (const idx of skillSet) {
      studentSkills.push(skills[idx]);
    }

    const studentData = {
      id: studentId,
      firstName,
      lastName,
      password: 'Password123!',
      personalInfo: {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.edu`,
        phone: generatePhilippinePhoneNumber(),
        dateOfBirth: new Date(1998 + Math.floor(Math.random() * 7), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `${Math.floor(Math.random() * 9999) + 1} Sample Street, Maynila, Philippines`,
        course: getRandomElement(courses),
        year: Math.floor(Math.random() * 4) + 1
      },
      skills: studentSkills,
      gpa: generateRandomGPA(),
      achievements: [],
    };

    promises.push(
      axios.post('http://localhost:5000/api/students', studentData)
        .catch(err => console.error(`Error creating ${studentId}:`, err.message))
    );
  }
  await Promise.all(promises);
}

async function main() {
  console.log('🚀 Starting generation of 1000 Filipino students...');
  const batchSize = 10;
  for (let i = 0; i < 1000; i += batchSize) {
    await createBatch(i, batchSize);
    console.log(`✅ Completed ${Math.min(i + batchSize, 1000)}/1000 students`);
  }
  console.log('✅ Finished generating all students!');
  process.exit(0);
}

main();
