import { useState } from 'react';
import type { MarcRecord as MarcRecordType } from '../types/marc';
import { ControlFieldDisplay, DataFieldDisplay } from './FieldDisplay';
import { getRecordTitle } from '../lib/marc-parser';

interface MarcRecordProps {
  record: MarcRecordType;
}

function LeaderDisplay({ leader }: { leader: MarcRecordType['leader'] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const leaderFields = [
    { label: 'Record Length', value: leader.recordLength },
    { label: 'Record Status', value: leader.recordStatus },
    { label: 'Type of Record', value: leader.typeOfRecord },
    { label: 'Bibliographic Level', value: leader.bibliographicLevel },
    { label: 'Type of Control', value: leader.typeOfControl },
    { label: 'Character Coding', value: leader.characterCodingScheme },
    { label: 'Base Address', value: leader.baseAddressOfData },
    { label: 'Encoding Level', value: leader.encodingLevel },
    { label: 'Descriptive Form', value: leader.descriptiveCatalogingForm },
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
            LDR
          </span>
          <span className="font-mono text-sm text-gray-600">{leader.raw}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white">
          {leaderFields.map((field) => (
            <div key={field.label} className="text-sm">
              <span className="text-gray-500">{field.label}: </span>
              <span className="font-mono text-gray-700">{field.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarcRecord({ record }: MarcRecordProps) {
  const title = getRecordTitle(record);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-xl font-semibold text-gray-800 truncate" title={title}>
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {record.controlFields.length} control fields, {record.dataFields.length} data fields
        </p>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Leader
          </h3>
          <LeaderDisplay leader={record.leader} />
        </section>

        {record.controlFields.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Control Fields
            </h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {record.controlFields.map((field, index) => (
                <ControlFieldDisplay key={`${field.tag}-${index}`} field={field} />
              ))}
            </div>
          </section>
        )}

        {record.dataFields.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Data Fields
            </h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {record.dataFields.map((field, index) => (
                <DataFieldDisplay key={`${field.tag}-${index}`} field={field} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
