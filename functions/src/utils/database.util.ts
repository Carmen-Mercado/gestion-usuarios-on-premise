import { db } from '../config/firebase';

/**
 * Utility function to clear all data from the database
 * WARNING: This will delete all data! Use with caution.
 */
export async function clearDatabase() {
  try {
    // Remove all data from the root
    await db.ref('/').remove();
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw new Error('Failed to clear database');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  clearDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
