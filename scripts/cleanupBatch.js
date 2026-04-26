import axios from 'axios';

async function deleteStudentBatch(ids) {
  const promises = ids.map(id =>
    axios.delete(`http://localhost:5000/api/students/${id}`)
      .catch(err => console.error(`Error deleting ${id}`))
  );
  return Promise.all(promises);
}

async function cleanupOldStudents() {
  try {
    console.log('🧹 Cleaning up old STU-format students...');
    
    // Delete students STU000001 to STU001000
    let deleted = 0;
    const batchSize = 50;
    
    for (let i = 1; i <= 1000; i += batchSize) {
      const batch = [];
      for (let j = i; j < i + batchSize && j <= 1000; j++) {
        batch.push(`STU${String(j).padStart(6, '0')}`);
      }
      
      await deleteStudentBatch(batch);
      deleted += batch.length;
      console.log(`✅ Deleted ${deleted}/1000 old students`);
    }
    
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupOldStudents();
