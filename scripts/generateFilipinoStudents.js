import axios from 'axios';

const filipinoFirstNames = [
  'Jose', 'Maria', 'Juan', 'Rosa', 'Miguel', 'Ana', 'Carlos', 'Flores', 'Diego', 'Isabel',
  'Pedro', 'Carmen', 'Francisco', 'Dolores', 'Antonio', 'Mercedes', 'Ramon', 'Josefina', 'Andres', 'Margarita',
  'Pablo', 'Lucia', 'Enrique', 'Soledad', 'Manuel', 'Consuelo', 'Gabriel', 'Pilar', 'Gonzalo', 'Lourdes',
  'Alfonso', 'Benita', 'Alfredo', 'Fidela', 'Sergio', 'Aurelia', 'Hector', 'Natividad', 'Ernesto', 'Rosita',
  'Vicente', 'Erlinda', 'Fidel', 'Celestina', 'Mariano', 'Martina', 'Ruben', 'Felicita', 'Fernando', 'Rosaria',
  'Leonardo', 'Purificacion', 'Arturo', 'Encarnacion', 'Ricardo', 'Presentacion', 'Salvador', 'Adoracion', 'Edgardo', 'Exaltacion',
  'Reynaldo', 'Pascuala', 'Geronimo', 'Transito', 'Diosdado', 'Ruperta', 'Florentino', 'Engracia', 'Abundio', 'Salvacion',
  'Armando', 'Eladia', 'Camilo', 'Marcela', 'Rodolfo', 'Fausta', 'Rolando', 'Fidelia', 'Abelardo', 'Elisa',
  'Leoncio', 'Porfiria', 'Agapito', 'Guadaña', 'Anastacio', 'Justina', 'Policarpio', 'Marciana', 'Gregorio', 'Onia',
  'Bernardo', 'Laureana', 'Constancio', 'Gregoria', 'Eustaquio', 'Constancia', 'Pancracio', 'Bernardina', 'Hilario', 'Honorina',
  'Ramon', 'Petrona', 'Ismael', 'Fecunda', 'Herminio', 'Escolastica', 'Teofilo', 'Gregonia', 'Liberato', 'Dominica',
  'Arcadio', 'Telesfora', 'Remigio', 'Teofila', 'Epifanio', 'Genoveva', 'Arnulfo', 'Proculina', 'Felisberto', 'Matilde',
  'Aniceto', 'Olegaria', 'Aurelio', 'Leonor', 'Nemesio', 'Balbina', 'Timoteo', 'Robustiana', 'Praxedes', 'Nieves',
  'Primitivo', 'Clotilde', 'Avelino', 'Teodora', 'Regino', 'Isadora', 'Gregorio', 'Estraea', 'Hilario', 'Silveria',
];

const filipinoLastNames = [
  'Santos', 'Cruz', 'Garcia', 'Lopez', 'Reyes', 'Fernandez', 'Gonzales', 'Velasquez', 'Castillo', 'Morales',
  'Medina', 'Castro', 'Guerrero', 'Mercado', 'Vargas', 'Ramos', 'Mendoza', 'Flores', 'Cortes', 'Ruiz',
  'Navarro', 'Ortega', 'Molina', 'Campos', 'Diaz', 'Salinas', 'Carrillo', 'Iglesias', 'Jimenez', 'Romero',
  'Perez', 'Soto', 'Chavez', 'Romero', 'Hidalgo', 'Moya', 'Montes', 'Rosales', 'Vega', 'Herrera',
  'Escobar', 'Aguilar', 'Torres', 'Acosta', 'Barrera', 'Orozco', 'Fuentes', 'Estrada', 'Delgado', 'Miranda',
  'Saavedra', 'Nunez', 'Avalos', 'Benitez', 'Cano', 'Casillas', 'Cedillo', 'Cervantes', 'Chacon', 'Chaves',
  'Cisneros', 'Cordova', 'Coronado', 'Corrales', 'Cortinas', 'Cota', 'Cotto', 'Covey', 'Crockett', 'Crosby',
  'Cruz', 'Cruzado', 'Cuadra', 'Cuenca', 'Cuevas', 'Cuevas', 'Cullen', 'Cumming', 'Cunningham', 'Curtiss',
  'Dahl', 'Dahms', 'Dailey', 'Dale', 'Dales', 'Dalton', 'Daly', 'Dameron', 'Damos', 'Danaher',
  'Danforth', 'Dangerous', 'Daniel', 'Daniels', 'Danner', 'Dantes', 'Dantley', 'Danz', 'Darby', 'Dare',
  'Darga', 'Dargie', 'Dario', 'Darley', 'Darleston', 'Darley', 'Darnall', 'Darnel', 'Darnier', 'Darrah',
  'Darragh', 'Darrall', 'Darren', 'Darringer', 'Darrow', 'Dart', 'Darton', 'Darwin', 'Daryl', 'Dash',
  'Daskam', 'Daspit', 'Date', 'Dathan', 'Datillo', 'Daton', 'Dattilo', 'Datto', 'Daub', 'Daubenheis',
  'Daudelin', 'Dauer', 'Daugard', 'Daugharty', 'Daugherty', 'Daugman', 'Daul', 'Dauler', 'Daulton', 'Daum',
  'Daumer', 'Daun', 'Daunce', 'Daune', 'Daur', 'Daurelle', 'Daus', 'Dauser', 'Daut', 'Dauth',
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
  'communication',
  'problem-solving',
  'teamwork',
  'photography',
  'video editing',
  'graphic design',
  'writing',
  'research',
  'data analysis',
  'statistics'
];

const courses = [
  'BS Computer Science',
  'BS Information Technology',
  'BS Engineering',
  'BS Business Administration',
  'BS Education',
  'AB Psychology',
  'BA Communication',
  'BS Nursing'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomGPA() {
  return (Math.random() * 1.5 + 2.5).toFixed(2); // GPA between 2.5 and 4.0
}

function generateStudentData(index) {
  const firstName = getRandomElement(filipinoFirstNames);
  const lastName = getRandomElement(filipinoLastNames);
  const studentId = `STU${String(index + 1).padStart(6, '0')}`;
  
  // Randomly assign 1-4 skills
  const studentSkills = [];
  const skillCount = Math.floor(Math.random() * 4) + 1;
  const skillIndexes = new Set();
  while (skillIndexes.size < skillCount) {
    skillIndexes.add(Math.floor(Math.random() * skills.length));
  }
  for (const idx of skillIndexes) {
    studentSkills.push(skills[idx]);
  }

  return {
    id: studentId,
    firstName,
    lastName,
    password: 'Password123!', // Default password
    personalInfo: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@student.edu`,
      phone: `+63${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      dateOfBirth: new Date(1998 + Math.floor(Math.random() * 7), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      address: `${Math.floor(Math.random() * 9999) + 1} Sample Street, Maynila, Philippines`,
      course: getRandomElement(courses),
      year: Math.floor(Math.random() * 4) + 1
    },
    skills: studentSkills,
    gpa: generateRandomGPA(),
    achievements: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function generateAndUploadStudents(count = 1000) {
  console.log(`🚀 Starting generation of ${count} Filipino students...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < count; i++) {
    try {
      const studentData = generateStudentData(i);
      
      const response = await axios.post('http://localhost:5000/api/students', studentData);
      
      successCount++;
      
      if ((i + 1) % 100 === 0) {
        console.log(`✅ Successfully created ${i + 1}/${count} students`);
      }
    } catch (error) {
      errorCount++;
      if (error.response?.status === 400) {
        // Likely duplicate ID, try with a different ID
        const studentData = generateStudentData(Date.now() + Math.random());
        try {
          await axios.post('http://localhost:5000/api/students', studentData);
          successCount++;
        } catch (retryError) {
          console.error(`❌ Error creating student ${i + 1}:`, retryError.message);
        }
      }
    }
  }
  
  console.log(`\n✅ Completed! Successfully created: ${successCount}/${count} students`);
  if (errorCount > 0) {
    console.log(`⚠️  Errors: ${errorCount}`);
  }
}

// Run the script
generateAndUploadStudents(1000);
