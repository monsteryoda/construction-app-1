"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, User, Flag, MessageSquare, Image, X, Eye, Download, CheckCircle2, MessageSquare as MessageIcon } from 'lucide-react';
import { Issue } from './IssueTypes';
import { deleteIssueImage } from './IssueActions';

interface Remark {
  id: string;
  remark: string;
  created_by: string;
  created_at: string;
}

interface IssueCardProps {
  issue: Issue;
  onDeleteImage: (imageId: string) => Promise<void>;
  onStatusChange?: (issueId: string, newStatus: string) => Promise<void>;
  onAddRemark?: (issueId: string, remark: string) => Promise<void>;
  onDeleteRemark?: (remarkId: string) => Promise<void>;
}

export default function IssueCard({ issue, onDeleteImage, onStatusChange, onAddRemark, onDeleteRemark }: IssueCardProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const [remarkAdded, setRemarkAdded] = useState(false);

  // Clear newRemark when issue changes
  useEffect(() => {
    setNewRemark('');
    setRemarkAdded(false);
    console.log('[IssueCard] Issue changed, cleared newRemark');
  }, [issue.id]);

  // Debug: Log when component renders
  useEffect(() => {
    console.log('[IssueCard] Rendering for issue:', issue.id);
    console.log('[IssueCard] Activity remarks:', issue.activity_remarks);
  }, [issue.id, issue.activity_remarks]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'safety':
        return <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Flag className="w-5 h-5 text-red-600" /></div>;
      case 'quality':
        return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 text-blue-600" /></div>;
      default:
        return <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><MessageSquare className="w-5 h-5 text-slate-600" /></div>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await onDeleteImage(imageId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange || !issue.id) return;
    
    try {
      setIsChangingStatus(true);
      await onStatusChange(issue.id, newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim() || !onAddRemark || !issue.id) return;
    
    try {
      setIsAddingRemark(true);
      await onAddRemark(issue.id, newRemark.trim());
      setRemarkAdded(true);
    } catch (error) {
      console.error('Error adding remark:', error);
    } finally {
      setIsAddingRemark(false);
    }
  };

  const handleDeleteRemark = async (remarkId: string) => {
    if (!onDeleteRemark) return;
    
    try {
      await onDeleteRemark(remarkId);
    } catch (error) {
      console.error('Error deleting remark:', error);
    }
  };

  const formatRemarkDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Card key={issue.id} className="hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'high' ? '#f97316' : issue.severity === 'medium' ? '#eab308' : '#22c55e' }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {getTypeIcon(issue.issue_type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{issue.issue_title}</h3>
                  {issue.projects?.project_name && (
                    <p className="text-sm text-blue-600">{issue.projects.project_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Mark as Resolved Button */}
                  {issue.status !== 'resolved' && (
                    <Button
                      onClick={() => handleStatusChange('resolved')}
                      disabled={isChangingStatus}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {isChangingStatus ? 'Marking...' : 'Mark as Resolved'}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className={getStatusColor(issue.status)}>
                  {issue.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                  {issue.severity.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {issue.issue_type}
                </Badge>
              </div>
              <p className="text-slate-600 text-sm mb-4">{issue.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                {issue.reported_by && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Reported by: {issue.reported_by}</span>
                  </div>
                )}
                {issue.assigned_to && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Assigned to: {issue.assigned_to}</span>
                  </div>
                )}
                {issue.reported_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(issue.reported_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {issue.resolution_notes && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Resolution: </span>
                    {issue.resolution_notes}
                  </p>
                </div>
              )}

              {/* Remarks Section */}
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageIcon className="w-5 h-5 text-slate-500" />
                  <h4 className="font-semibold text-slate-900">Remarks</h4>
                  <Badge variant="outline" className="ml-auto">
                    {issue.activity_remarks?.length || 0}
                  </Badge>
                </div>
                
                {/* Remarks List */}
                {issue.activity_remarks && issue.activity_remarks.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {issue.activity_remarks.map((remark: Remark) => (
                      <div key={remark.id} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">{remark.remark}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <User className="w-3 h-3" />
                              <span>{remark.created_by}</span>
                              <span>•</span>
                              <span>{formatRemarkDate(remark.created_at)}</span>
                            </div>
                          </div>
                          {onDeleteRemark && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRemark(remark.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-500"
                              title="Delete remark"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic mb-4">No remarks yet</p>
                )}

                {/* Add Remark Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRemark();
                      }
                    }}
                    placeholder="Add a remark..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isAddingRemark}
                  />
                  <Button
                    type="button"
                    onClick={handleAddRemark}
                    disabled={!newRemark.trim() || isAddingRemark}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAddingRemark ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </div>

              {/* Display Multiple Images */}
              {issue.images && issue.images.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {issue.images.length} image(s)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {issue.images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.image_url}
                          alt={image.file_name}
                          className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setShowImageDialog(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Download button for each image */}
                        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(index);
                              setShowImageDialog(true);
                            }}
                          >
                            <a href={image.image_url} download>
                              <Download className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      {showImageDialog && issue.images && issue.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Issue Images</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  Image {selectedImageIndex + 1} of {issue.images.length}
                </span>
                <button
                  type="button"
                  onClick={() => setShowImageDialog(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <Image className="w-12 h-12 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{issue.images[selectedImageIndex]?.file_name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(issue.images[selectedImageIndex]?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={issue.images[selectedImageIndex]?.image_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={issue.images[selectedImageIndex]?.image_url} download>
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t bg-slate-50">
              <div className="flex gap-2">
                {selectedImageIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(prev => prev - 1)}
                    className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                  >
                    Previous
                  </button>
                )}
                {selectedImageIndex < issue.images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(prev => prev + 1)}
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