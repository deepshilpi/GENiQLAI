import React from 'react';
import { DatabaseConnectionManager } from '@/components/database-connection-manager';

export default function DatabasePage() {
  return (
    <div className="container py-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Database Management</h1>
      <DatabaseConnectionManager />
    </div>
  );
}