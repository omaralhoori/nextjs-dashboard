'use client';

import { ExclamationTriangleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import { Button } from '@/app/ui/button';

interface PermissionErrorProps {
  errorType: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR';
}

export default function PermissionError({ errorType }: PermissionErrorProps) {
  const handleLogout = async () => {
    await signOut();
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'PERMISSION_DENIED':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to view pending pharmacies. Please contact your administrator.',
          icon: ExclamationTriangleIcon,
        };
      case 'UNAUTHORIZED':
        return {
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again to continue.',
          icon: ExclamationTriangleIcon,
        };
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your connection and try again.',
          icon: ExclamationTriangleIcon,
        };
      default:
        return {
          title: 'Error',
          message: 'An unexpected error occurred.',
          icon: ExclamationTriangleIcon,
        };
    }
  };

  const { title, message, icon: Icon } = getErrorMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center">
        <Icon className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-8 max-w-md">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Logout
          </Button>
          
          {errorType === 'NETWORK_ERROR' && (
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
