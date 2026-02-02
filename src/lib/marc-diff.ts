import type { MarcRecord, ControlField, DataField, Subfield } from '../types/marc';

export type DiffStatus = 'unchanged' | 'added' | 'removed' | 'modified';

export interface FieldDiff {
  status: DiffStatus;
  left?: ControlField | DataField;
  right?: ControlField | DataField;
}

export interface RecordDiff {
  leaderChanged: boolean;
  leftLeader: string;
  rightLeader: string;
  fields: FieldDiff[];
}

function serializeControlField(field: ControlField): string {
  return `${field.tag}:${field.value}`;
}

function serializeSubfield(subfield: Subfield): string {
  return `$${subfield.code}${subfield.value}`;
}

function serializeDataField(field: DataField): string {
  const subfields = field.subfields.map(serializeSubfield).join('');
  return `${field.tag}:${field.indicator1}${field.indicator2}:${subfields}`;
}

function serializeField(field: ControlField | DataField): string {
  if ('subfields' in field) {
    return serializeDataField(field);
  }
  return serializeControlField(field);
}

export function compareRecords(left: MarcRecord | null, right: MarcRecord | null): RecordDiff {
  const result: RecordDiff = {
    leaderChanged: false,
    leftLeader: left?.leader.raw ?? '',
    rightLeader: right?.leader.raw ?? '',
    fields: [],
  };

  if (left && right) {
    result.leaderChanged = left.leader.raw !== right.leader.raw;
  } else {
    result.leaderChanged = true;
  }

  // Combine all fields with their tags for comparison
  const leftFields: (ControlField | DataField)[] = left
    ? [...left.controlFields, ...left.dataFields]
    : [];
  const rightFields: (ControlField | DataField)[] = right
    ? [...right.controlFields, ...right.dataFields]
    : [];

  // Create maps keyed by serialized field content
  const leftMap = new Map<string, (ControlField | DataField)[]>();
  const rightMap = new Map<string, (ControlField | DataField)[]>();

  for (const field of leftFields) {
    const key = serializeField(field);
    if (!leftMap.has(key)) leftMap.set(key, []);
    leftMap.get(key)!.push(field);
  }

  for (const field of rightFields) {
    const key = serializeField(field);
    if (!rightMap.has(key)) rightMap.set(key, []);
    rightMap.get(key)!.push(field);
  }

  // Track which fields have been matched
  const matchedLeft = new Set<string>();
  const matchedRight = new Set<string>();

  // Find unchanged fields (exact matches)
  for (const [key, fields] of leftMap) {
    if (rightMap.has(key)) {
      const rightCount = rightMap.get(key)!.length;
      const leftCount = fields.length;
      const matchCount = Math.min(leftCount, rightCount);

      for (let i = 0; i < matchCount; i++) {
        result.fields.push({
          status: 'unchanged',
          left: fields[i],
          right: rightMap.get(key)![i],
        });
      }

      if (matchCount === leftCount) matchedLeft.add(key);
      if (matchCount === rightCount) matchedRight.add(key);
    }
  }

  // Group remaining fields by tag for modified detection
  const leftByTag = new Map<string, (ControlField | DataField)[]>();
  const rightByTag = new Map<string, (ControlField | DataField)[]>();

  for (const [key, fields] of leftMap) {
    if (matchedLeft.has(key)) continue;
    const matchedCount = rightMap.has(key) ? Math.min(fields.length, rightMap.get(key)!.length) : 0;
    const remaining = fields.slice(matchedCount);
    for (const field of remaining) {
      if (!leftByTag.has(field.tag)) leftByTag.set(field.tag, []);
      leftByTag.get(field.tag)!.push(field);
    }
  }

  for (const [key, fields] of rightMap) {
    if (matchedRight.has(key)) continue;
    const matchedCount = leftMap.has(key) ? Math.min(fields.length, leftMap.get(key)!.length) : 0;
    const remaining = fields.slice(matchedCount);
    for (const field of remaining) {
      if (!rightByTag.has(field.tag)) rightByTag.set(field.tag, []);
      rightByTag.get(field.tag)!.push(field);
    }
  }

  // Match modified fields (same tag, different content)
  const processedLeftFields = new Set<ControlField | DataField>();
  const processedRightFields = new Set<ControlField | DataField>();

  for (const [tag, leftTagFields] of leftByTag) {
    const rightTagFields = rightByTag.get(tag) || [];

    for (let i = 0; i < leftTagFields.length; i++) {
      if (i < rightTagFields.length) {
        result.fields.push({
          status: 'modified',
          left: leftTagFields[i],
          right: rightTagFields[i],
        });
        processedLeftFields.add(leftTagFields[i]);
        processedRightFields.add(rightTagFields[i]);
      }
    }
  }

  // Add removed fields (only in left)
  for (const [, fields] of leftByTag) {
    for (const field of fields) {
      if (!processedLeftFields.has(field)) {
        result.fields.push({
          status: 'removed',
          left: field,
        });
      }
    }
  }

  // Add added fields (only in right)
  for (const [, fields] of rightByTag) {
    for (const field of fields) {
      if (!processedRightFields.has(field)) {
        result.fields.push({
          status: 'added',
          right: field,
        });
      }
    }
  }

  // Sort fields by tag
  result.fields.sort((a, b) => {
    const tagA = a.left?.tag || a.right?.tag || '';
    const tagB = b.left?.tag || b.right?.tag || '';
    return tagA.localeCompare(tagB);
  });

  return result;
}
