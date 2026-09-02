// Joins class names and drops the falsy ones, so callers can write
// cn("base", isActive && "active", className) without stray "false" in the DOM.
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
