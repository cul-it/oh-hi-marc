import type { MarcRecord } from '../types/marc';
import { getRecordTitle } from '../lib/marc-parser';

interface DiffRecordSelectorProps {
  leftRecords: MarcRecord[];
  rightRecords: MarcRecord[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DiffRecordSelector({
  leftRecords,
  rightRecords,
  selectedIndex,
  onSelect,
}: DiffRecordSelectorProps) {
  const maxRecords = Math.max(leftRecords.length, rightRecords.length);

  if (maxRecords <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <label htmlFor="diff-record-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Compare Record:
      </label>
      <select
        id="diff-record-select"
        value={selectedIndex}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border bg-white"
      >
        {Array.from({ length: maxRecords }).map((_, index) => {
          const leftTitle = leftRecords[index] ? getRecordTitle(leftRecords[index]) : '(no record)';
          const rightTitle = rightRecords[index] ? getRecordTitle(rightRecords[index]) : '(no record)';
          const truncLeft = leftTitle.length > 30 ? leftTitle.slice(0, 30) + '...' : leftTitle;
          const truncRight = rightTitle.length > 30 ? rightTitle.slice(0, 30) + '...' : rightTitle;

          return (
            <option key={index} value={index}>
              #{index + 1}: {truncLeft} vs {truncRight}
            </option>
          );
        })}
      </select>
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {selectedIndex + 1} of {maxRecords}
      </span>
    </div>
  );
}
