import { db } from '../config/firebase';

async function clearDatabase() {
  try {
    // Remove all data from the root
    await db.ref('/').remove();
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    process.exit(0);
  }
}

clearDatabase();
