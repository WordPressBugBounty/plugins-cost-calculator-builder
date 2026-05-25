import { reactive, watch } from "vue";
import type { IField, ISection } from "@/admin/shared/types/fields.type";

const MIN_FIELD_WIDTH = 10;
const MAX_FIELD_WIDTH = 100;

const CONTAINER_FIELD_TYPES = new Set(["group", "repeater"]);

export function isContainerField(field: IField): boolean {
  if (CONTAINER_FIELD_TYPES.has(field.type)) return true;
  const groupEl = (field as { groupElements?: unknown }).groupElements;
  return Array.isArray(groupEl);
}

export function clampFieldWidth(value: number): number {
  return Math.min(
    MAX_FIELD_WIDTH,
    Math.max(MIN_FIELD_WIDTH, Math.round(value)),
  );
}

export function getNormalizedFieldWidth(field: IField): number {
  return clampFieldWidth(Number(field.width) || MAX_FIELD_WIDTH);
}

export function getRowOccupiedWidth(
  rowFields: IField[],
  excludeAlias?: string,
): number {
  return rowFields.reduce((acc, field) => {
    if (excludeAlias && field.alias === excludeAlias) return acc;
    return acc + getNormalizedFieldWidth(field);
  }, 0);
}

export function getRowFreeWidth(
  rowFields: IField[],
  excludeAlias?: string,
): number {
  return Math.max(
    0,
    MAX_FIELD_WIDTH - getRowOccupiedWidth(rowFields, excludeAlias),
  );
}

export function computeInitialRows(fields: IField[]): IField[][] {
  const rows: IField[][] = [];
  let current: IField[] = [];
  let sum = 0;

  const flushCurrent = () => {
    if (current.length > 0) {
      rows.push(current);
      current = [];
      sum = 0;
    }
  };

  for (const field of fields) {
    if (isContainerField(field)) {
      flushCurrent();
      if (Number(field.width) !== MAX_FIELD_WIDTH) {
        field.width = MAX_FIELD_WIDTH;
      }
      rows.push([field]);
      continue;
    }

    const width = getNormalizedFieldWidth(field);
    const forceBreak = field.rowBreak === true && current.length > 0;
    const overflow = sum + width > MAX_FIELD_WIDTH && current.length > 0;

    if (forceBreak || overflow) {
      flushCurrent();
    }
    current.push(field);
    sum += width;
  }

  flushCurrent();
  return rows;
}

function normalizeRowBreakFlags(rows: IField[][]): void {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 0; j < row.length; j++) {
      const field = row[j];
      const shouldBreak = i > 0 && j === 0;

      if (shouldBreak) {
        if (field.rowBreak !== true) {
          field.rowBreak = true;
        }
      } else if (field.rowBreak === true) {
        field.rowBreak = false;
      }
    }
  }
}

export function fitFieldToRow(field: IField, rowFields: IField[]): boolean {
  const free = getRowFreeWidth(rowFields, field.alias);

  if (free >= MIN_FIELD_WIDTH) {
    const current = getNormalizedFieldWidth(field);
    if (current <= free) return false;

    field.width = free;
    return true;
  }

  return redistributeRowWidths(rowFields);
}

function redistributeRowWidths(rowFields: IField[]): boolean {
  const count = rowFields.length;
  if (count === 0) return false;

  const baseWidth = Math.floor(MAX_FIELD_WIDTH / count);
  if (baseWidth < MIN_FIELD_WIDTH) return false;

  const remainder = MAX_FIELD_WIDTH - baseWidth * count;

  for (let i = 0; i < count; i++) {
    rowFields[i].width = i === 0 ? baseWidth + remainder : baseWidth;
  }
  return true;
}

function getSectionKey(section: ISection): string {
  return String(section._id ?? section.alias);
}

type SectionRowsState = Record<string, IField[][]>;
type SectionWatchers = Record<string, () => void>;
type SectionRefs = Record<string, ISection>;

const state = reactive<SectionRowsState>({});
const watchers: SectionWatchers = {};
const sectionRefs: SectionRefs = {};

function fieldsAliasesEqual(a: IField[], b: IField[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].alias !== b[i].alias) return false;
  }
  return true;
}

function fieldsRefsEqual(a: IField[], b: IField[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function flattenRows(rows: IField[][]): IField[] {
  const out: IField[] = [];
  for (const row of rows) {
    for (const field of row) out.push(field);
  }
  return out;
}

export function ensureSectionRows(section: ISection): IField[][] {
  const key = getSectionKey(section);

  const sectionChanged = sectionRefs[key] !== section;

  if (sectionChanged) {
    if (watchers[key]) {
      watchers[key]();
      delete watchers[key];
    }
    sectionRefs[key] = section;
    state[key] = computeInitialRows(section.fields);
  } else if (!state[key]) {
    state[key] = computeInitialRows(section.fields);
  }

  if (!watchers[key]) {
    const syncFromSection = () => {
      const currentFlat = flattenRows(state[key] || []);
      if (fieldsRefsEqual(currentFlat, section.fields)) return;
      state[key] = computeInitialRows(section.fields);
    };

    const stopRef = watch(() => section.fields, syncFromSection, {
      deep: false,
    });
    const stopLen = watch(() => section.fields.length, syncFromSection);

    const stopWidths = watch(
      () =>
        section.fields
          .map((f) => `${f.alias}:${Number(f.width) || MAX_FIELD_WIDTH}`)
          .join("|"),
      () => rebalanceRowsIfOverflow(section),
    );

    watchers[key] = () => {
      stopRef();
      stopLen();
      stopWidths();
    };
  }

  return state[key];
}

export function rebalanceRowsIfOverflow(section: ISection): void {
  const key = getSectionKey(section);
  const rows = state[key];
  if (!rows) return;

  const hasOverflow = rows.some((row) => {
    if (row.length === 0) return false;
    const sum = row.reduce(
      (acc, f) => acc + (Number(f.width) || MAX_FIELD_WIDTH),
      0,
    );
    return sum > MAX_FIELD_WIDTH;
  });

  if (!hasOverflow) return;

  state[key] = computeInitialRows(section.fields);
  normalizeRowBreakFlags(state[key]);
}

export function getSectionRows(section: ISection): IField[][] {
  return ensureSectionRows(section);
}

export function isolateContainersInState(section: ISection): void {
  const key = getSectionKey(section);
  const rows = state[key];
  if (!rows) return;

  const newRows: IField[][] = [];

  for (const row of rows) {
    if (row.length === 0) continue;

    let buffer: IField[] = [];
    for (const field of row) {
      if (isContainerField(field)) {
        if (Number(field.width) !== MAX_FIELD_WIDTH) {
          field.width = MAX_FIELD_WIDTH;
        }
        if (buffer.length > 0) {
          newRows.push(buffer);
          buffer = [];
        }
        newRows.push([field]);
      } else {
        buffer.push(field);
      }
    }
    if (buffer.length > 0) {
      newRows.push(buffer);
    }
  }

  let same = newRows.length === rows.length;
  if (same) {
    for (let i = 0; i < newRows.length; i++) {
      if (newRows[i].length !== rows[i].length) {
        same = false;
        break;
      }
      for (let j = 0; j < newRows[i].length; j++) {
        if (newRows[i][j] !== rows[i][j]) {
          same = false;
          break;
        }
      }
      if (!same) break;
    }
  }

  if (!same) {
    state[key] = newRows;
  }
}

export function commitRowsToSection(section: ISection): void {
  const key = getSectionKey(section);
  const rows = state[key];
  if (!rows) return;

  normalizeRowBreakFlags(rows);

  const flat = flattenRows(rows);

  if (fieldsAliasesEqual(section.fields, flat)) return;

  section.fields = flat;
}

export function cleanupEmptyRows(section: ISection): void {
  const key = getSectionKey(section);
  const rows = state[key];
  if (!rows) return;

  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].length === 0) rows.splice(i, 1);
  }
}

export function fitFieldAtRow(
  section: ISection,
  rowIndex: number,
  newIndex: number,
): IField | null {
  const rows = state[getSectionKey(section)];
  if (!rows || !rows[rowIndex]) return null;

  const row = rows[rowIndex];
  const field = row[newIndex];
  if (!field) return null;

  if (isContainerField(field)) {
    if (Number(field.width) !== MAX_FIELD_WIDTH) {
      field.width = MAX_FIELD_WIDTH;
    }
    return field;
  }

  if (row.some(isContainerField)) {
    return field;
  }

  fitFieldToRow(field, row);
  return field;
}

export function stopSectionRowsWatcher(section: ISection): void {
  const key = getSectionKey(section);
  if (watchers[key]) {
    watchers[key]();
    delete watchers[key];
  }
  delete state[key];
  delete sectionRefs[key];
}

export { MIN_FIELD_WIDTH, MAX_FIELD_WIDTH };
