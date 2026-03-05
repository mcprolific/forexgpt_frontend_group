
    
  
import React from 'react';
import { mockActivityLog } from '../../../data/mockData';

const ActivityLog = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Activity Log</h1>
      <div className="space-y-4">
        {mockActivityLog.map(log => (
          <div key={log.id} className="bg-white p-4 rounded-lg shadow">
            <p className="font-medium">{log.action}</p>
            <p className="text-sm text-gray-500">{log.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;