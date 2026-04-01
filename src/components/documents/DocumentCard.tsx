"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, X, FileUp, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Document } from './DocumentTypes';
import { deleteDocumentFile } from './DocumentActions';

interface DocumentCardProps {
  document: Document;
  onDeleteFile: (fileId: string) => Promise<void>;
  onEdit?: (document: Document) => void;
  onDelete?: (documentId: string) => Promise<void>;
}

export default function DocumentCard({ document, onDeleteFile, onEdit, onDelete }: DocumentCardProps) {
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [showFileMenu, setShowFileMenu] = useState(false);

  const getFileIcon = (documentType: string) => {
    switch (documentType.toLowerCase()) {
      case 'drawing':
        return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>;
      case 'contract':
        return <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-green-600" /></div>;
      case 'photo':
        return <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>;
      default:
        return <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-slate-600" /></div>;
    }
  };

  const getFileIconSmall = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      return <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-red-600" /></div>;
    } else if (ext === 'doc' || ext === 'docx') {
      return <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>;
    } else if (ext === 'xls' || ext === 'xlsx') {
      return <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-green-600" /></div>;
    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif') {
      return <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-purple-600" /></div>;
    }
    return <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-slate-600" /></div>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await onDeleteFile(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDeleteDocument = async () => {
    if (onDelete && document.id) {
      try {
        await onDelete(document.id);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(document);
    }
  };

  const handleFileClick = (index: number) => {
    setSelectedFileIndex(index);
    setShowFileDialog(true);
  };

  const handleDownload = (e: React.MouseEvent, fileUrl: string, fileName: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.click();
  };

  const handleView = (e: React.MouseEvent, fileUrl: string) => {
    e.stopPropagation();
    window.open(fileUrl, '_blank');
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {getFileIcon(document.document_type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 truncate">{document.document_name}</h3>
                  {document.projects?.project_name && (
                    <p className="text-sm text-blue-600">{document.projects.project_name}</p>
                  )}
                </div>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  v{document.version}
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-2 line-clamp-2">{document.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                </div>
                {document.file_size > 0 && (
                  <span>{formatFileSize(document.file_size)}</span>
                )}
                <span className="capitalize">{document.document_type || 'Other'}</span>
              </div>

              {/* Display Multiple Files */}
              {document.files && document.files.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileUp className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {document.files.length} file(s)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFileMenu(!showFileMenu)}
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document.files.map((file, index) => (
                      <div 
                        key={file.id} 
                        className={`relative group cursor-pointer ${selectedFileIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleFileClick(index)}
                      >
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 hover:border-blue-500 transition-colors">
                          {getFileIconSmall(file.file_name)}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                              {file.file_name}
                            </p>
                            <p className="text-xs text-slate-500">{formatFileSize(file.file_size)}</p>
                          </div>
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Quick actions on hover */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => handleView(e, file.file_url)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => handleDownload(e, file.file_url, file.file_name)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download/View Buttons for main document */}
              {document.file_url && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={document.file_url} download>
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </Button>
                </div>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                  title="Edit document"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteDocument}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      {showFileDialog && document.files && document.files.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFileDialog(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Document Files</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  File {selectedFileIndex + 1} of {document.files.length}
                </span>
                <button
                  onClick={() => setShowFileDialog(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                {getFileIconSmall(document.files[selectedFileIndex]?.file_name || '')}
                <div>
                  <p className="font-medium text-slate-900">{document.files[selectedFileIndex]?.file_name}</p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(document.files[selectedFileIndex]?.file_size || 0)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={(e) => handleView(e, document.files[selectedFileIndex]?.file_url || '')}>
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={(e) => handleDownload(e, document.files[selectedFileIndex]?.file_url || '', document.files[selectedFileIndex]?.file_name || '')}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t bg-slate-50">
              <div className="flex gap-2">
                {selectedFileIndex > 0 && (
                  <button
                    onClick={() => setSelectedFileIndex(prev => prev - 1)}
                    className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                  >
                    Previous
                  </button>
                )}
                {selectedFileIndex < document.files.length - 1 && (
                  <button
                    onClick={() => setSelectedFileIndex(prev => prev + 1)}
                    className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}