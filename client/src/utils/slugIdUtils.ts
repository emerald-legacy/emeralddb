export function toSlugId(input: string): string {
  return input
    .toLowerCase()
    .replaceAll('ā', 'a')
    .replaceAll('ō', 'o')
    .replaceAll('ū', 'u')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll(/\W/g, ' ')
    .replaceAll(' ', '-')
    .replaceAll('--', '-')
}
