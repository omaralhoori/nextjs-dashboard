'use client';

import { useState } from 'react';
import { fetchPendingPharmaciesAction } from '@/app/lib/actions';

export default function ConnectionTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...\n');
    
    try {
      console.log('Starting connection test...');
      const result = await fetchPendingPharmaciesAction();
      
      if ('error' in result) {
        setTestResult(prev => prev + `Error: ${result.error}\n`);
      } else {
        setTestResult(prev => prev + `Success! Found ${result.pharmacies.length} pharmacies\n`);
      }
    } catch (error) {
      setTestResult(prev => prev + `Exception: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Connection Test</h3>
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      <div className="mt-4">
        <h4 className="font-medium mb-2">Test Results:</h4>
        <pre className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
          {testResult || 'Click "Test Connection" to see results'}
        </pre>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Environment Variables:</strong></p>
        <p>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
}
