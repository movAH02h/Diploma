import React, { forwardRef, useState } from 'react';

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
        {fileInfo ? (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg text-sm ${fileInfo.tooBig ? 'bg-red-900/30 border border-red-500/50' : 'bg-[#252525]'}`}>
              <p className="text-white font-medium">{fileInfo.name}</p>
              <p className="text-[#888] text-xs">
                {fileInfo.size} MB 
                {fileInfo.tooBig && <span className="text-red-400 ml-1">(exceeds {MAX_SIZE_MB} MB)</span>}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="w-full py-2 bg-[#333] hover:bg-[#444] text-white rounded-lg text-sm transition"
            >
              Clear
            </button>
          </div>
        ) : (
          <label className="block bg-[#333] hover:bg-[#444] text-white font-medium py-3 px-4 rounded-lg cursor-pointer text-center transition">
            Choose audio file
            <input
              type="file"
              accept="audio/*"
              onChange={handleChange}
              ref={ref}
              className="hidden"
            />
          </label>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
export default FileUpload;