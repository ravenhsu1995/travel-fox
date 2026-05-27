const LOCATION_SEPARATOR_RE = /\s*[•·]\s*/u;

export function normalizeLocationChip(value: string): string {
  return value.trim();
}

export function splitLocationChips(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(LOCATION_SEPARATOR_RE)
    .map(normalizeLocationChip)
    .filter(Boolean);
}

export function joinLocationChips(
  chips: readonly string[],
  separator = " · ",
): string | null {
  const cleaned = chips.map(normalizeLocationChip).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(separator) : null;
}

export function normalizeJoinedLocationChips(
  value: string | null | undefined,
  separator = " · ",
): string | null {
  return joinLocationChips(splitLocationChips(value), separator);
}
