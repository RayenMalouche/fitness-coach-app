// Photo Upload Component
// Allows clients to upload meal photos with captions

import { useState } from 'react';
import { photoAPI } from '../services/api';

export default function PhotoUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  // Hardcoded coach ID for demo - in production, this would come from coach selection
  const COACH_ID = 'coach-id-here'; // You'll need to get this from your seeded data

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('caption', caption);
    formData.append('coachId', COACH_ID);

    try {
      await photoAPI.upload(formData);
      alert('Photo uploaded successfully!');
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Meal Photo
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>

        {/* Caption Input */}
        {selectedFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (Optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Add a note about this meal..."
            />
          </div>
        )}

        {/* Submit Button */}
        {selectedFile && (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Photo'}
          </button>
        )}
      </form>
    </div>
  );
}