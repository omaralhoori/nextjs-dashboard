'use client';

import { useState } from 'react';
import { XMarkIcon, DocumentIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PharmacyFilesResponse, PharmacyFile, fetchPharmacyFilesAction, downloadPharmacyFileAction } from '@/app/lib/actions';

interface PharmacyFilesModalProps {
  pharmacyId: string;
  pharmacyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PharmacyFilesModal({ pharmacyId, pharmacyName, isOpen, onClose }: PharmacyFilesModalProps) {
  const [filesData, setFilesData] = useState<PharmacyFilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const loadFiles = async () => {
    if (filesData) return; // Already loaded
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchPharmacyFilesAction(pharmacyId);
      if ('error' in result) {
        setError('Failed to load pharmacy files');
      } else {
        setFilesData(result.data);
      }
    } catch (err) {
      setError('Failed to load pharmacy files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: PharmacyFile) => {
    setDownloadingFiles(prev => new Set(prev).add(file.id));
    
    try {
      const result = await downloadPharmacyFileAction(file.id);
      if ('error' in result) {
        alert('Failed to download file');
      } else {
        // Create download link
        const url = window.URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Failed to download file');
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'business_permit':
        return 'bg-blue-100 text-blue-800';
      case 'professional_id':
        return 'bg-green-100 text-green-800';
      case 'pharmacy_license':
        return 'bg-purple-100 text-purple-800';
      case 'other_document':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'business_permit':
        return 'Business Permit';
      case 'professional_id':
        return 'Professional ID';
      case 'pharmacy_license':
        return 'Pharmacy License';
      case 'other_document':
        return 'Other Document';
      default:
        return fileType;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Pharmacy Files - {pharmacyName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!filesData && !loading && !error && (
            <div className="text-center py-8">
              <button
                onClick={loadFiles}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Load Files
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading files...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadFiles}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {filesData && (
            <div className="space-y-6">
              {/* Pharmacy Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Pharmacy Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      filesData.pharmacy.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {filesData.pharmacy.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Documents Uploaded:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      filesData.pharmacy.hasUploadedDocuments 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {filesData.pharmacy.hasUploadedDocuments ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Files Stats */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Files Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Files:</span>
                    <span className="ml-2">{filesData.stats.totalFiles}</span>
                  </div>
                  <div>
                    <span className="font-medium">All Required Files:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      filesData.stats.hasAllRequiredFiles 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {filesData.stats.hasAllRequiredFiles ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                {filesData.stats.missingTypes.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium text-red-600">Missing Documents:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {filesData.stats.missingTypes.map((type) => (
                        <span key={type} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          {getFileTypeLabel(type)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Files List */}
              <div>
                <h3 className="font-semibold mb-4">Uploaded Files</h3>
                {filesData.files.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No files uploaded</p>
                ) : (
                  <div className="space-y-3">
                    {filesData.files.map((file) => (
                      <div key={file.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <DocumentIcon className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="font-medium">{file.fileName}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className={`px-2 py-1 rounded-full text-xs ${getFileTypeColor(file.fileType)}`}>
                                  {getFileTypeLabel(file.fileType)}
                                </span>
                                <span>{formatFileSize(file.fileSize)}</span>
                                <span>•</span>
                                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(file)}
                            disabled={downloadingFiles.has(file.id)}
                            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>{downloadingFiles.has(file.id) ? 'Downloading...' : 'Download'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
