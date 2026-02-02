import { useState } from 'react';
import type { MarcRecord } from '../types/marc';
import type { RecordDiff, FieldDiff, DiffStatus } from '../lib/marc-diff';
import { compareRecords } from '../lib/marc-diff';
import { getRecordTitle } from '../lib/marc-parser';

interface DiffViewProps {
  leftRecords: MarcRecord[];
  rightRecords: MarcRecord[];
  leftFileName: string;
  rightFileName: string;
  selectedIndex: number;
}

function getStatusColor(status: DiffStatus): { bg: string; border: string; text: string } {
  switch (status) {
    case 'added':
      return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
    case 'removed':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    case 'modified':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
    default:
      return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-700' };
  }
}

function FieldContent({ field }: { field: FieldDiff['left'] | FieldDiff['right'] }) {
  if (!field) {
    return <span className="text-gray-400 italic text-base">—</span>;
  }

  if ('subfields' in field) {
    return (
      <div className="font-mono text-base">
        <span className="text-gray-400 mr-2">
          {field.indicator1 === ' ' ? '_' : field.indicator1}
          {field.indicator2 === ' ' ? '_' : field.indicator2}
        </span>
        {field.subfields.map((sf, i) => (
          <span key={i}>
            <span className="text-indigo-600 font-semibold">${sf.code}</span>
            <span>{sf.value}</span>
            {i < field.subfields.length - 1 && ' '}
          </span>
        ))}
      </div>
    );
  }

  return <span className="font-mono text-base">{field.value}</span>;
}

function DiffFieldRow({ diff }: { diff: FieldDiff }) {
  const colors = getStatusColor(diff.status);
  const tag = diff.left?.tag || diff.right?.tag || '';

  return (
    <div className={`grid grid-cols-[100px_1fr_1fr] gap-3 py-3 px-4 ${colors.bg} border-b ${colors.border}`}>
      <div className="flex items-start gap-2">
        <span className={`font-mono text-base font-semibold ${colors.text}`}>{tag}</span>
        {diff.status !== 'unchanged' && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
            {diff.status === 'added' && '+'}
            {diff.status === 'removed' && '−'}
            {diff.status === 'modified' && '~'}
          </span>
        )}
      </div>
      <div>
        <FieldContent field={diff.left} />
      </div>
      <div>
        <FieldContent field={diff.right} />
      </div>
    </div>
  );
}

function LeaderDiff({ diff, hidden }: { diff: RecordDiff; hidden: boolean }) {
  if (hidden && !diff.leaderChanged) {
    return null;
  }

  const colors = getStatusColor(diff.leaderChanged ? 'modified' : 'unchanged');

  return (
    <div className={`grid grid-cols-[100px_1fr_1fr] gap-3 py-3 px-4 ${colors.bg} border-b ${colors.border}`}>
      <div className="flex items-start gap-2">
        <span className={`font-mono text-base font-semibold ${colors.text}`}>LDR</span>
        {diff.leaderChanged && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
            ~
          </span>
        )}
      </div>
      <div className="font-mono text-base text-gray-600 break-all">
        {diff.leftLeader || <span className="text-gray-400 italic">—</span>}
      </div>
      <div className="font-mono text-base text-gray-600 break-all">
        {diff.rightLeader || <span className="text-gray-400 italic">—</span>}
      </div>
    </div>
  );
}

export function DiffView({ leftRecords, rightRecords, leftFileName, rightFileName, selectedIndex }: DiffViewProps) {
  const [hideUnchanged, setHideUnchanged] = useState(false);

  const leftRecord = leftRecords[selectedIndex] || null;
  const rightRecord = rightRecords[selectedIndex] || null;
  const diff = compareRecords(leftRecord, rightRecord);

  const leftTitle = leftRecord ? getRecordTitle(leftRecord) : 'No record';
  const rightTitle = rightRecord ? getRecordTitle(rightRecord) : 'No record';

  const stats = {
    added: diff.fields.filter(f => f.status === 'added').length,
    removed: diff.fields.filter(f => f.status === 'removed').length,
    modified: diff.fields.filter(f => f.status === 'modified').length + (diff.leaderChanged ? 1 : 0),
    unchanged: diff.fields.filter(f => f.status === 'unchanged').length + (diff.leaderChanged ? 0 : 1),
  };

  const filteredFields = hideUnchanged
    ? diff.fields.filter(f => f.status !== 'unchanged')
    : diff.fields;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-2 border-b border-gray-200">
        <div className="px-4 py-3 bg-blue-50 border-r border-gray-200">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Left (Original)</p>
          <p className="text-sm font-medium text-gray-800 truncate mt-1" title={leftFileName}>
            {leftFileName}
          </p>
          <p className="text-xs text-gray-500 truncate" title={leftTitle}>
            {leftTitle}
          </p>
        </div>
        <div className="px-4 py-3 bg-green-50">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Right (Modified)</p>
          <p className="text-sm font-medium text-gray-800 truncate mt-1" title={rightFileName}>
            {rightFileName}
          </p>
          <p className="text-xs text-gray-500 truncate" title={rightTitle}>
            {rightTitle}
          </p>
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-4 text-sm">
        <span className="text-gray-500">Changes:</span>
        {stats.added > 0 && (
          <span className="text-green-700">
            <span className="font-semibold">+{stats.added}</span> added
          </span>
        )}
        {stats.removed > 0 && (
          <span className="text-red-700">
            <span className="font-semibold">−{stats.removed}</span> removed
          </span>
        )}
        {stats.modified > 0 && (
          <span className="text-amber-700">
            <span className="font-semibold">~{stats.modified}</span> modified
          </span>
        )}
        {stats.added === 0 && stats.removed === 0 && stats.modified === 0 && (
          <span className="text-gray-500">No differences</span>
        )}
        <span className="text-gray-400">{stats.unchanged} unchanged</span>

        <button
          onClick={() => setHideUnchanged(!hideUnchanged)}
          className={`ml-auto px-3 py-1 text-sm font-medium rounded-md border transition-colors ${
            hideUnchanged
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {hideUnchanged ? 'Show All' : 'Hide Unchanged'}
        </button>
      </div>

      <div className="grid grid-cols-[100px_1fr_1fr] gap-3 py-2 px-4 bg-gray-100 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
        <div>Tag</div>
        <div>Left</div>
        <div>Right</div>
      </div>

      <div>
        <LeaderDiff diff={diff} hidden={hideUnchanged} />
        {filteredFields.map((fieldDiff, index) => (
          <DiffFieldRow key={index} diff={fieldDiff} />
        ))}
      </div>
    </div>
  );
}
