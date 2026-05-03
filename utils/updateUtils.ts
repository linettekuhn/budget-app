export function isVersionLessThan(current: string, minimum: string): boolean {
  const curr = current.split(".").map(Number);
  const min = minimum.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((curr[i] ?? 0) < (min[i] ?? 0)) return true;
    if ((curr[i] ?? 0) > (min[i] ?? 0)) return false;
  }
  return false;
}
