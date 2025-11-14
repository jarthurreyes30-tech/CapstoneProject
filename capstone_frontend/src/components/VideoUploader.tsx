import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getApiUrl } from '../lib/api';

interface Video {
  id: number;
  original_filename: string;
  status: 'pending' | 'processing' | 'ready' | 'rejected';
  thumbnail_url?: string;
  stream_url: string;
  formatted_size: string;
  formatted_duration?: string;
}

interface VideoUploaderProps {
  campaignId: number;
  onUploadComplete?: (video: Video) => void;
  maxSizeMB?: number;
  allowedFormats?: string[];
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  campaignId,
  onUploadComplete,
  maxSizeMB = 50,
  allowedFormats = ['mp4', 'webm', 'mov'],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedFormats.includes(extension)) {
      return `Invalid file type. Allowed: ${allowedFormats.join(', ').toUpperCase()}`;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `File size (${sizeMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${getApiUrl()}/campaigns/${campaignId}/videos`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      setUploadedVideo(response.data.video);
      setSelectedFile(null);
      setUploadProgress(0);
      
      if (onUploadComplete) {
        onUploadComplete(response.data.video);
      }

      // Poll for processing status
      pollVideoStatus(response.data.video.id);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const pollVideoStatus = async (videoId: number) => {
    const maxAttempts = 30; // Poll for up to 5 minutes
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(poll);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${getApiUrl()}/videos/${videoId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );

        const video = response.data.video;
        setUploadedVideo(video);

        if (video.status === 'ready' || video.status === 'rejected') {
          clearInterval(poll);
        }
      } catch (err) {
        console.error('Poll error:', err);
        clearInterval(poll);
      }
    }, 10000); // Poll every 10 seconds
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadedVideo(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!selectedFile && !uploadedVideo && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your video here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: {allowedFormats.join(', ').toUpperCase()} • Max size: {maxSizeMB}MB
          </p>
          <input
            type="file"
            accept={allowedFormats.map(f => `.${f}`).join(',')}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            Select Video
          </label>
        </div>
      )}

      {/* Selected File Info */}
      {selectedFile && !isUploading && !uploadedVideo && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <button
            onClick={handleUpload}
            className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
          >
            Upload Video
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center space-x-3 mb-3">
            <Loader className="h-5 w-5 text-blue-500 animate-spin" />
            <p className="font-medium text-gray-900">Uploading...</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{uploadProgress}% complete</p>
        </div>
      )}

      {/* Uploaded Video Status */}
      {uploadedVideo && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {uploadedVideo.status === 'processing' && (
                <Loader className="h-5 w-5 text-blue-500 animate-spin mt-1" />
              )}
              {uploadedVideo.status === 'ready' && (
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-1" />
              )}
              {uploadedVideo.status === 'rejected' && (
                <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {uploadedVideo.original_filename}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  Status: {uploadedVideo.status}
                </p>
                {uploadedVideo.formatted_duration && (
                  <p className="text-sm text-gray-500">
                    Duration: {uploadedVideo.formatted_duration}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {uploadedVideo.status === 'processing' && (
            <p className="text-sm text-blue-600 mt-3">
              ⏳ Your video is being processed. This may take a few minutes...
            </p>
          )}

          {uploadedVideo.status === 'ready' && uploadedVideo.thumbnail_url && (
            <img
              src={uploadedVideo.thumbnail_url}
              alt="Video thumbnail"
              className="mt-3 rounded w-full max-w-xs"
            />
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
