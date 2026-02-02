export interface Leader {
  recordLength: number;
  recordStatus: string;
  typeOfRecord: string;
  bibliographicLevel: string;
  typeOfControl: string;
  characterCodingScheme: string;
  indicatorCount: number;
  subfieldCodeCount: number;
  baseAddressOfData: number;
  encodingLevel: string;
  descriptiveCatalogingForm: string;
  multipartResourceRecordLevel: string;
  lengthOfLengthOfField: number;
  lengthOfStartingCharacterPosition: number;
  lengthOfImplementationDefined: number;
  raw: string;
}

export interface ControlField {
  tag: string;
  value: string;
}

export interface Subfield {
  code: string;
  value: string;
}

export interface DataField {
  tag: string;
  indicator1: string;
  indicator2: string;
  subfields: Subfield[];
}

export interface MarcRecord {
  leader: Leader;
  controlFields: ControlField[];
  dataFields: DataField[];
}

export type Field = ControlField | DataField;

export function isDataField(field: Field): field is DataField {
  return 'subfields' in field;
}

export function isControlField(field: Field): field is ControlField {
  return !('subfields' in field);
}
