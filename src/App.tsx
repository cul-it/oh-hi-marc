import { useState, useCallback } from 'react';
import type { MarcRecord as MarcRecordType } from './types/marc';
import { parseMARC } from './lib/marc-parser';
import { FileUpload } from './components/FileUpload';
import { RecordSelector } from './components/RecordSelector';
import { MarcRecord } from './components/MarcRecord';
import { DiffFileUpload } from './components/DiffFileUpload';
import { DiffView } from './components/DiffView';
import { DiffRecordSelector } from './components/DiffRecordSelector';

type AppMode = 'view' | 'diff';

function App() {
  const [mode, setMode] = useState<AppMode>('view');

  const [records, setRecords] = useState<MarcRecordType[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [leftRecords, setLeftRecords] = useState<MarcRecordType[]>([]);
  const [rightRecords, setRightRecords] = useState<MarcRecordType[]>([]);
  const [leftFileName, setLeftFileName] = useState<string>('');
  const [rightFileName, setRightFileName] = useState<string>('');
  const [diffSelectedIndex, setDiffSelectedIndex] = useState(0);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const parsedRecords = parseMARC(buffer);

      if (parsedRecords.length === 0) {
        setError('No valid MARC records found in the file.');
        setRecords([]);
      } else {
        setRecords(parsedRecords);
        setSelectedIndex(0);
      }
    } catch (e) {
      console.error('Error parsing MARC file:', e);
      setError('Failed to parse the MARC file. Please ensure it is a valid MARC21 binary file.');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDiffFilesSelect = useCallback(async (leftFile: File, rightFile: File) => {
    setIsLoading(true);
    setError(null);
    setLeftFileName(leftFile.name);
    setRightFileName(rightFile.name);

    try {
      const [leftBuffer, rightBuffer] = await Promise.all([
        leftFile.arrayBuffer(),
        rightFile.arrayBuffer(),
      ]);

      const leftParsed = parseMARC(leftBuffer);
      const rightParsed = parseMARC(rightBuffer);

      if (leftParsed.length === 0 && rightParsed.length === 0) {
        setError('No valid MARC records found in either file.');
        setLeftRecords([]);
        setRightRecords([]);
      } else {
        setLeftRecords(leftParsed);
        setRightRecords(rightParsed);
        setDiffSelectedIndex(0);
      }
    } catch (e) {
      console.error('Error parsing MARC files:', e);
      setError('Failed to parse the MARC files. Please ensure they are valid MARC21 binary files.');
      setLeftRecords([]);
      setRightRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setRecords([]);
    setSelectedIndex(0);
    setLeftRecords([]);
    setRightRecords([]);
    setDiffSelectedIndex(0);
    setError(null);
    setFileName(null);
    setLeftFileName('');
    setRightFileName('');
  }, []);

  const handleModeChange = useCallback((newMode: AppMode) => {
    handleReset();
    setMode(newMode);
  }, [handleReset]);

  const hasViewContent = records.length > 0;
  const hasDiffContent = leftRecords.length > 0 || rightRecords.length > 0;
  const hasContent = hasViewContent || hasDiffContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <a
        href="https://github.com/cul-it/oh-hi-marc"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-5 right-4 z-50 text-gray-400 hover:text-gray-900 transition-colors"
        aria-label="View source on GitHub"
      >
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </a>

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="w-32 hidden sm:block" />

            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Oh Hi MARC!</h1>
              <p className="text-sm text-gray-500">A Simple MARC Record Viewer / Diff Tool</p>
            </div>

            <div className="flex items-center gap-4 w-32 justify-end">
              {!hasContent && (
                <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                  <button
                    onClick={() => handleModeChange('view')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      mode === 'view'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleModeChange('diff')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      mode === 'diff'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Diff
                  </button>
                </div>
              )}

              {hasContent && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'view' ? (
          records.length === 0 ? (
            <div className="max-w-xl mx-auto">
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error parsing file</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-900">MARC21 Support</h3>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-900">Multiple Records</h3>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-900">Processed Locally</h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-medium">{fileName}</span>
                  <span className="text-gray-400">|</span>
                  <span>
                    {records.length} record{records.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              )}

              <RecordSelector
                records={records}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />

              <MarcRecord record={records[selectedIndex]} />
            </div>
          )
        ) : (
          !hasDiffContent ? (
            <div className="max-w-2xl mx-auto">
              <DiffFileUpload onFilesSelect={handleDiffFilesSelect} isLoading={isLoading} />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error parsing files</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Upload two MARC files to compare them side by side.
                  <br />
                  Differences will be highlighted with colors.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <DiffRecordSelector
                leftRecords={leftRecords}
                rightRecords={rightRecords}
                selectedIndex={diffSelectedIndex}
                onSelect={setDiffSelectedIndex}
              />

              <DiffView
                leftRecords={leftRecords}
                rightRecords={rightRecords}
                leftFileName={leftFileName}
                rightFileName={rightFileName}
                selectedIndex={diffSelectedIndex}
              />
            </div>
          )
        )}
      </main>

      <footer className="mt-auto py-4 text-center">
        <p className="text-xs text-black-400 font-mono">{__COMMIT_HASH__}</p>
        <p className="text-[8px] text-gray-300 mt-1">No Tommy Wiseaus were harmed in the making of this application.</p>
      </footer>
    </div>
  );
}

export default App;
