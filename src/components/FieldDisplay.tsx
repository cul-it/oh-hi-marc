import type { ControlField, DataField } from '../types/marc';

interface ControlFieldDisplayProps {
  field: ControlField;
}

export function ControlFieldDisplay({ field }: ControlFieldDisplayProps) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
      <span className="font-mono text-sm font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded min-w-[3.5rem] text-center">
        {field.tag}
      </span>
      <span className="font-mono text-sm text-gray-700 break-all">{field.value}</span>
    </div>
  );
}

interface DataFieldDisplayProps {
  field: DataField;
}

function getTagColor(tag: string): { bg: string; text: string } {
  const tagNum = parseInt(tag, 10);

  if (tagNum >= 1 && tagNum <= 99) {
    return { bg: 'bg-blue-50', text: 'text-blue-700' };
  }
  if (tagNum >= 100 && tagNum <= 199) {
    return { bg: 'bg-purple-50', text: 'text-purple-700' };
  }
  if (tagNum >= 200 && tagNum <= 299) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
  }
  if (tagNum >= 300 && tagNum <= 399) {
    return { bg: 'bg-cyan-50', text: 'text-cyan-700' };
  }
  if (tagNum >= 400 && tagNum <= 499) {
    return { bg: 'bg-orange-50', text: 'text-orange-700' };
  }
  if (tagNum >= 500 && tagNum <= 599) {
    return { bg: 'bg-pink-50', text: 'text-pink-700' };
  }
  if (tagNum >= 600 && tagNum <= 699) {
    return { bg: 'bg-rose-50', text: 'text-rose-700' };
  }
  if (tagNum >= 700 && tagNum <= 799) {
    return { bg: 'bg-violet-50', text: 'text-violet-700' };
  }
  if (tagNum >= 800 && tagNum <= 899) {
    return { bg: 'bg-teal-50', text: 'text-teal-700' };
  }

  return { bg: 'bg-gray-50', text: 'text-gray-700' };
}

export function DataFieldDisplay({ field }: DataFieldDisplayProps) {
  const colors = getTagColor(field.tag);

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
      <span
        className={`font-mono text-sm font-semibold ${colors.text} ${colors.bg} px-2 py-0.5 rounded min-w-[3.5rem] text-center`}
      >
        {field.tag}
      </span>
      <span className="font-mono text-xs text-gray-400 py-0.5 min-w-[2rem] text-center">
        {field.indicator1 === ' ' ? '_' : field.indicator1}
        {field.indicator2 === ' ' ? '_' : field.indicator2}
      </span>
      <div className="flex-1 font-mono text-sm">
        {field.subfields.map((subfield, index) => (
          <span key={index} className="inline">
            <span className="text-indigo-600 font-semibold">${subfield.code}</span>
            <span className="text-gray-700">{subfield.value}</span>
            {index < field.subfields.length - 1 && <span className="text-gray-300"> </span>}
          </span>
        ))}
      </div>
    </div>
  );
}
