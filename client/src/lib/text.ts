export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : undefined;

  if (!first) {
    return '';
  }

  const initials = last ? first.charAt(0) + last.charAt(0) : first.slice(0, 2);

  return initials.toUpperCase();
}

