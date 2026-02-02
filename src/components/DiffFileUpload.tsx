import { useCallback, useState } from 'react';

interface DiffFileUploadProps {
  onFilesSelect: (leftFile: File, rightFile: File) => void;
  isLoading: boolean;
}

function SingleDropZone({
  label,
  file,
  onFileSelect,
  colorClass,
}: {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  colorClass: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const droppedFile = files[0];
        if (droppedFile.name.endsWith('.mrc') || droppedFile.name.endsWith('.marc')) {
          onFileSelect(droppedFile);
        } else {
          alert('Please upload a MARC file (.mrc or .marc)');
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center
        transition-all duration-200 ease-in-out cursor-pointer
        ${isDragging ? `${colorClass} bg-opacity-10` : 'border-gray-300 hover:border-gray-400'}
        ${file ? 'border-solid' : ''}
      `}
    >
      <input
        type="file"
        accept=".mrc,.marc"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="space-y-2">
        <p className={`text-sm font-medium ${file ? 'text-gray-700' : 'text-gray-500'}`}>{label}</p>
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 font-medium truncate max-w-[150px]">{file.name}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Drop file or click to browse</p>
        )}
      </div>
    </div>
  );
}

export function DiffFileUpload({ onFilesSelect, isLoading }: DiffFileUploadProps) {
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);

  const handleCompare = useCallback(() => {
    if (leftFile && rightFile) {
      onFilesSelect(leftFile, rightFile);
    }
  }, [leftFile, rightFile, onFilesSelect]);

  const canCompare = leftFile && rightFile && !isLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SingleDropZone
          label="Left File (Original)"
          file={leftFile}
          onFileSelect={setLeftFile}
          colorClass="border-red-400"
        />
        <SingleDropZone
          label="Right File (Modified)"
          file={rightFile}
          onFileSelect={setRightFile}
          colorClass="border-green-400"
        />
      </div>

      <button
        onClick={handleCompare}
        disabled={!canCompare}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
          ${
            canCompare
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          'Compare Files'
        )}
      </button>
    </div>
  );
}
