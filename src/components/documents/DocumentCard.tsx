"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, X, FileUp, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Document } from './DocumentTypes';
import { deleteDocumentFile } from './DocumentActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentCardProps {
  document: Document;
  onDeleteFile: (fileId: string) => Promise<void>;
  onEdit?: (document: Document) => void;
  onDelete?: (documentId: string) => Promise<void>;
}

export default function DocumentCard({ document, onDeleteFile, onEdit, onDelete }: DocumentCardProps) {
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

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

  return (
    <>
      <Card className="hover:shadow-md transition-shadow border border-slate-200">
        <CardContent className="p-0">
          <div className="flex">
            {/* Left Section - Icon and Info */}
            <div className="flex-1 p-4">
              <div className="flex items-start gap-3">
                {getFileIcon(document.document_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm truncate">{document.document_name}</h3>
                      {document.projects?.project_name && (
                        <p className="text-xs text-blue-600 mt-0.5">{document.projects.project_name}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      v{document.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{document.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    {document.file_size > 0 && (
                      <span>{formatFileSize(document.file_size)}</span>
                    )}
                    <span className="capitalize">{document.document_type || 'Other'}</span>
                  </div>
                </div>
              </div>

              {/* Files Section */}
              {document.files && document.files.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileUp className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-medium text-slate-700">
                      {document.files.length} file(s)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document.files.map((file, index) => (
                      <div key={file.id} className="relative group">
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded border border-slate-200">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                              {file.file_name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete file"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        {/* Download/View buttons for each file */}
                        <div className="absolute top-full left-0 mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 px-1.5"
                            asChild
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFileIndex(index);
                              setShowFileDialog(true);
                            }}
                          >
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-3 h-3" />
                            </a>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 px-1.5"
                            asChild
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFileIndex(index);
                              setShowFileDialog(true);
                            }}
                          >
                            <a href={file.file_url} download>
                              <Download className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download/View Buttons for main document */}
              {document.file_url && (
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="gap-1 h-8">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 h-8">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="border-l border-slate-200 p-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={handleDeleteDocument} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                <FileText className="w-12 h-12 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{document.files[selectedFileIndex]?.file_name}</p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(document.files[selectedFileIndex]?.file_size || 0)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={document.files[selectedFileIndex]?.file_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={document.files[selectedFileIndex]?.file_url} download>
                    <Download className="w-4 h-4" />
                    Download
                  </a>
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