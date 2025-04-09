// src/components/DataMigration.jsx
import React, { useState } from 'react';
import { migrateAllData } from '../utils/migrateDataToFirebase';

const DataMigration = () => {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState('');

  const handleMigration = async () => {
    if (window.confirm('This will migrate all data to Firebase. Continue?')) {
      setMigrating(true);
      setResult('Migration in progress...');
      
      try {
        await migrateAllData();
        setResult('Migration completed successfully!');
      } catch (error) {
        setResult(`Migration failed: ${error.message}`);
        console.error('Migration error:', error);
      } finally {
        setMigrating(false);
      }
    }
  };

  return (
    <div className="p-6 bg-[var(--bg-tertiary)] rounded-lg shadow-lg max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Firebase Data Migration</h2>
      <p className="mb-4 text-[var(--text-secondary)]">
        This utility will migrate your JSON data to Firebase Firestore.
        Use this only in development.
      </p>
      
      <button
        onClick={handleMigration}
        disabled={migrating}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {migrating ? 'Migrating...' : 'Start Migration'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-md">
          <p className="text-[var(--text-primary)]">{result}</p>
        </div>
      )}
    </div>
  );
};

export default DataMigration;