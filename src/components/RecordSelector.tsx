import type {MarcRecord} from '../types/marc';
import {getRecordTitle} from '../lib/marc-parser';

interface RecordSelectorProps {
    records: MarcRecord[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export function RecordSelector({records, selectedIndex, onSelect}: RecordSelectorProps) {
    if (records.length <= 1) {
        return null;
    }

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <select
                id="record-select"
                value={selectedIndex}
                onChange={(e) => onSelect(Number(e.target.value))}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border bg-white"
            >
                {records.map((record, index) => {
                    const title = getRecordTitle(record);
                    const truncatedTitle = title.length > 60 ? title.slice(0, 60) + '...' : title;
                    return (
                        <option key={index} value={index}>
                            Record {index + 1}: {truncatedTitle}
                        </option>
                    );
                })}
            </select>
            <span className="text-sm text-gray-500 whitespace-nowrap">
        {selectedIndex + 1} of {records.length}
      </span>
        </div>
    );
}
