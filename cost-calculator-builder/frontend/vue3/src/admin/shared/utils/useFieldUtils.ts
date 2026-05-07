import { IPageBreaker, IGroupField } from "@/admin/shared/types/fields.type";

export interface IFieldLocation {
  pageIndex: number;
  sectionIndex: number;
  fieldIndex: number;
  groupIndex?: number;
}

export function findFieldLocation(
  pages: IPageBreaker[],
  alias: string,
): IFieldLocation | null {
  for (let pi = 0; pi < pages.length; pi++) {
    const sections = pages[pi].groupElements;
    for (let si = 0; si < sections.length; si++) {
      const fields = sections[si].fields;
      for (let fi = 0; fi < fields.length; fi++) {
        if (fields[fi].alias === alias) {
          return { pageIndex: pi, sectionIndex: si, fieldIndex: fi };
        }
        if (
          "groupElements" in fields[fi] &&
          Array.isArray((fields[fi] as IGroupField).groupElements)
        ) {
          const groupFields = (fields[fi] as IGroupField).groupElements;
          for (let gi = 0; gi < groupFields.length; gi++) {
            if (groupFields[gi].alias === alias) {
              return {
                pageIndex: pi,
                sectionIndex: si,
                fieldIndex: fi,
                groupIndex: gi,
              };
            }
          }
        }
      }
    }
  }
  return null;
}

function nextAvailableId(ids: Set<number>): number {
  let newId = 0;
  while (ids.has(newId)) {
    newId++;
  }
  return newId;
}

export function generatePageId(pages: IPageBreaker[]): number {
  const ids = new Set<number>();
  for (const page of pages) {
    if (page._id !== undefined) ids.add(Number(page._id));
  }
  return nextAvailableId(ids);
}

export function generateSectionId(pages: IPageBreaker[]): number {
  const ids = new Set<number>();
  for (const page of pages) {
    for (const section of page.groupElements) {
      if (section._id !== undefined) ids.add(Number(section._id));
    }
  }
  return nextAvailableId(ids);
}

export function generateFieldId(pages: IPageBreaker[]): number {
  const ids = new Set<number>();
  for (const page of pages) {
    for (const section of page.groupElements) {
      for (const field of section.fields) {
        if (field._id !== undefined && field._id !== null)
          ids.add(Number(field._id));

        if (
          "groupElements" in field &&
          Array.isArray((field as IGroupField).groupElements)
        ) {
          for (const child of (field as IGroupField).groupElements) {
            if (child._id !== undefined && child._id !== null)
              ids.add(Number(child._id));
          }
        }
      }
    }
  }
  return nextAvailableId(ids);
}
