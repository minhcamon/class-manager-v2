import type { StudentMatrix } from "@/types/matrix";

/**
 * Returns a Set of lowercase first names (the last token in a Vietnamese name)
 * that appear more than once among the students of a single group.
 */
export function getGroupDuplicateFirstNames(students: StudentMatrix[]): Set<string> {
  const counts = new Map<string, number>();

  for (const s of students) {
    if (!s.studentName) continue;
    const parts = s.studentName.trim().split(/\s+/);
    if (parts.length === 0) continue;
    const firstName = parts[parts.length - 1].toLowerCase();
    counts.set(firstName, (counts.get(firstName) || 0) + 1);
  }

  const duplicates = new Set<string>();
  for (const [name, count] of counts.entries()) {
    if (count > 1) {
      duplicates.add(name);
    }
  }

  return duplicates;
}

/**
 * Formats a student's full name progressively based on available column width
 * and whether their first name collides with another student in the same group.
 *
 * Thresholds:
 * - width >= 260px: Level 1 (Full Name) -> "Nguyễn Văn Đức Anh"
 * - 200px <= width < 260px: Level 2 (Shorten Last Name) -> "N. Văn Đức Anh"
 * - 160px <= width < 200px: Level 3 (Middle + First Name) -> "Đức Anh" (or "Đ. Anh" if collision)
 * - width < 160px: Level 4 (Ultra Compact) -> "Anh" (or "Đ. Anh" if collision)
 */
export function formatProgressiveStudentName(
  fullName: string,
  columnWidth: number,
  isDuplicateInGroup: boolean
): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;

  const lastName = parts[0];
  const middleNames = parts.slice(1, -1);
  const firstName = parts[parts.length - 1];

  // Disambiguation identifier for collision cases (e.g. "Đ. " from "Đức", or "N. " from "Nguyễn")
  const disambiguator =
    middleNames.length > 0
      ? middleNames[middleNames.length - 1].charAt(0).toUpperCase() + "."
      : lastName.charAt(0).toUpperCase() + ".";

  // Level 1: Full name (>= 260px)
  if (columnWidth >= 260) {
    return fullName;
  }

  // Level 2: Abbreviate last name (200px - 259px)
  if (columnWidth >= 200) {
    const middleStr = middleNames.length > 0 ? ` ${middleNames.join(" ")}` : "";
    return `${lastName.charAt(0).toUpperCase()}.${middleStr} ${firstName}`;
  }

  // Level 3: Shorten middle names (160px - 199px)
  if (columnWidth >= 160) {
    if (isDuplicateInGroup) {
      // Keep disambiguator or last middle name if available
      const closestMiddle = middleNames.length > 0 ? middleNames[middleNames.length - 1] : lastName;
      return `${closestMiddle} ${firstName}`;
    }
    // No duplicate -> show last middle name + first name if available, otherwise first name
    return middleNames.length > 0 ? `${middleNames[middleNames.length - 1]} ${firstName}` : firstName;
  }

  // Level 4: Ultra compact (< 160px)
  if (isDuplicateInGroup) {
    // ALWAYS preserve disambiguation when collision occurs!
    return `${disambiguator} ${firstName}`;
  }

  return firstName;
}
