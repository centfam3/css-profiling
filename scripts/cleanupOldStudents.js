import axios from 'axios';

async function deleteAllOldStudents() {
  try {
    console.log('🧹 Deleting all old students with STU prefix...');
    
    // Get all students
    const response = await axios.get('http://localhost:5000/api/students');
    const students = response.data;
    
    let deleted = 0;
    let skipped = 0;
    
    // Delete each student with STU prefix
    for (const student of students) {
      if (student.id && student.id.startsWith('STU')) {
        try {
          await axios.delete(`http://localhost:5000/api/students/${student.id}`);
          deleted++;
          if (deleted % 100 === 0) {
            console.log(`✅ Deleted ${deleted} students...`);
          }
        } catch (err) {
          console.error(`❌ Failed to delete ${student.id}:`, err.message);
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`\n✅ Cleanup complete!`);
    console.log(`Deleted: ${deleted} students`);
    console.log(`Skipped: ${skipped} students`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteAllOldStudents();
