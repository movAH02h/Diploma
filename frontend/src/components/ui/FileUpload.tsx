import React, { forwardRef, useState, useEffect } from 'react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  onClear: () => void;
  error?: string | null;
}

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onFileChange, onClear, error }, ref) => {
    const [fileInfo, setFileInfo] = useState<{ name: string; size: string; tooBig: boolean } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        onFileChange(null);
        setFileInfo(null);
        return;
      }

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const tooBig = file.size > MAX_SIZE_BYTES;
      
      setFileInfo({
        name: file.name.length > 35 ? file.name.slice(0, 32) + '...' : file.name,
        size: sizeMB,
        tooBig
      });

      onFileChange(tooBig ? null : file);
    };

    const handleClear = () => {
      onClear();
      setFileInfo(null);
    };

    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <label className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-full cursor-pointer text-center transition">
            📁 Choose audio
            <input
              type="file"
              accept="audio/*"
              onChange={handleChange}
              ref={ref}
              className="hidden"
            />
          </label>
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-full transition"
          >
            🗑️ Clear
          </button>
        </div>

        {fileInfo && (
          <div className={`p-3 rounded-xl text-sm ${fileInfo.tooBig ? 'bg-red-50 text-red-700' : 'bg-slate-100'}`}>
            <p className="font-medium">{fileInfo.name}</p>
            <p className="text-xs">
              {fileInfo.size} MB 
              {fileInfo.tooBig && <span className="text-red-600 ml-1">(exceeds {MAX_SIZE_MB} MB limit)</span>}
            </p>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
export default FileUpload;