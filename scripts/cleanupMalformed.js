import axios from 'axios';

async function cleanupMalformedStudents() {
  try {
    console.log('🧹 Finding and removing all malformed student IDs...');
    
    // Get all students
    const response = await axios.get('http://localhost:5000/api/students');
    const students = response.data;
    
    console.log(`📊 Total students in database: ${students.length}`);
    
    const toDelete = [];
    const toKeep = [];
    
    students.forEach(student => {
      const id = student.id;
      
      // Keep only students with IDs in format 220001-221000
      if (id && /^22000[1-9]$|^2200[1-9]\d$|^220\d{3}$|^221000$/.test(id)) {
        const num = parseInt(id);
        if (num >= 220001 && num <= 221000) {
          toKeep.push(id);
          return;
        }
      }
      
      // Everything else gets deleted
      toDelete.push(id);
    });
    
    console.log(`✅ Students to keep (220001-221000): ${toKeep.length}`);
    console.log(`❌ Students to delete (malformed): ${toDelete.length}`);
    
    if (toDelete.length === 0) {
      console.log('✅ No malformed students found!');
      process.exit(0);
    }
    
    // Delete in batches
    let deleted = 0;
    const batchSize = 50;
    
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      const promises = batch.map(id =>
        axios.delete(`http://localhost:5000/api/students/${id}`)
          .catch(err => console.error(`Error deleting ${id}`))
      );
      
      await Promise.all(promises);
      deleted += batch.length;
      console.log(`✅ Deleted ${deleted}/${toDelete.length} malformed students`);
    }
    
    console.log('\n✅ Cleanup complete! Database now contains only 220001-221000 format students.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupMalformedStudents();
