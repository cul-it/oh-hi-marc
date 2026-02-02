import type { MarcRecord, Leader, ControlField, DataField, Subfield } from '../types/marc';

const RECORD_TERMINATOR = 0x1d;
const FIELD_TERMINATOR = 0x1e;
const SUBFIELD_DELIMITER = 0x1f;

function parseLeader(data: Uint8Array): Leader {
  const decoder = new TextDecoder('utf-8');
  const raw = decoder.decode(data.slice(0, 24));

  return {
    recordLength: parseInt(raw.slice(0, 5), 10),
    recordStatus: raw[5],
    typeOfRecord: raw[6],
    bibliographicLevel: raw[7],
    typeOfControl: raw[8],
    characterCodingScheme: raw[9],
    indicatorCount: parseInt(raw[10], 10),
    subfieldCodeCount: parseInt(raw[11], 10),
    baseAddressOfData: parseInt(raw.slice(12, 17), 10),
    encodingLevel: raw[17],
    descriptiveCatalogingForm: raw[18],
    multipartResourceRecordLevel: raw[19],
    lengthOfLengthOfField: parseInt(raw[20], 10),
    lengthOfStartingCharacterPosition: parseInt(raw[21], 10),
    lengthOfImplementationDefined: parseInt(raw[22], 10),
    raw,
  };
}

interface DirectoryEntry {
  tag: string;
  fieldLength: number;
  startingPosition: number;
}

function parseDirectory(data: Uint8Array, baseAddress: number): DirectoryEntry[] {
  const decoder = new TextDecoder('utf-8');
  const entries: DirectoryEntry[] = [];

  const directoryData = data.slice(24, baseAddress - 1);
  const directoryStr = decoder.decode(directoryData);

  for (let i = 0; i < directoryStr.length; i += 12) {
    if (i + 12 > directoryStr.length) break;

    const entry = directoryStr.slice(i, i + 12);
    entries.push({
      tag: entry.slice(0, 3),
      fieldLength: parseInt(entry.slice(3, 7), 10),
      startingPosition: parseInt(entry.slice(7, 12), 10),
    });
  }

  return entries;
}

function parseSubfields(data: string): Subfield[] {
  const subfields: Subfield[] = [];
  const parts = data.split(String.fromCharCode(SUBFIELD_DELIMITER));

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.length > 0) {
      subfields.push({
        code: part[0],
        value: part.slice(1),
      });
    }
  }

  return subfields;
}

function parseField(tag: string, data: string): ControlField | DataField {
  if (tag.startsWith('00')) {
    return {
      tag,
      value: data.replace(String.fromCharCode(FIELD_TERMINATOR), ''),
    } as ControlField;
  }

  const indicator1 = data[0] || ' ';
  const indicator2 = data[1] || ' ';
  const subfieldData = data.slice(2).replace(String.fromCharCode(FIELD_TERMINATOR), '');

  return {
    tag,
    indicator1,
    indicator2,
    subfields: parseSubfields(subfieldData),
  } as DataField;
}

function parseRecord(data: Uint8Array): MarcRecord {
  const decoder = new TextDecoder('utf-8');
  const leader = parseLeader(data);
  const directory = parseDirectory(data, leader.baseAddressOfData);

  const controlFields: ControlField[] = [];
  const dataFields: DataField[] = [];

  for (const entry of directory) {
    const fieldStart = leader.baseAddressOfData + entry.startingPosition;
    const fieldEnd = fieldStart + entry.fieldLength;
    const fieldData = decoder.decode(data.slice(fieldStart, fieldEnd));

    const field = parseField(entry.tag, fieldData);

    if ('subfields' in field) {
      dataFields.push(field);
    } else {
      controlFields.push(field);
    }
  }

  return {
    leader,
    controlFields,
    dataFields,
  };
}

export function parseMARC(buffer: ArrayBuffer): MarcRecord[] {
  const data = new Uint8Array(buffer);
  const records: MarcRecord[] = [];

  let position = 0;

  while (position < data.length) {
    let recordEnd = position;
    while (recordEnd < data.length && data[recordEnd] !== RECORD_TERMINATOR) {
      recordEnd++;
    }

    if (recordEnd >= data.length && position === recordEnd) {
      break;
    }

    const recordData = data.slice(position, recordEnd + 1);

    if (recordData.length > 24) {
      try {
        const record = parseRecord(recordData);
        records.push(record);
      } catch (e) {
        console.error('Error parsing record at position', position, e);
      }
    }

    position = recordEnd + 1;
  }

  return records;
}

export function getRecordTitle(record: MarcRecord): string {
  const titleField = record.dataFields.find(f => f.tag === '245');
  if (titleField) {
    const titleSubfield = titleField.subfields.find(s => s.code === 'a');
    if (titleSubfield) {
      return titleSubfield.value.replace(/[\s/:;,]+$/, '');
    }
  }

  for (const tag of ['130', '240']) {
    const field = record.dataFields.find(f => f.tag === tag);
    if (field) {
      const subfield = field.subfields.find(s => s.code === 'a');
      if (subfield) {
        return subfield.value.replace(/[\s/:;,]+$/, '');
      }
    }
  }

  return 'Untitled Record';
}
