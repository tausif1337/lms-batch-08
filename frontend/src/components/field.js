// Shared plumbing for the labelled form controls: Input, Select and Textarea.
//
// A box wrapped in its own <label> already has an accessible name, so this is
// not about screen readers. It is about the two things a wrapper cannot give
// you: a `name`, which is what a browser's autofill and password manager key
// off, and an `id`, which is what the browser console asks for.
export function nameFromLabel(label) {
  if (typeof label !== "string") {
    return undefined;
  }

  // "Confirm new password" -> "confirm_new_password", which is the shape the
  // rest of the app already uses for field names.
  const name = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return name || undefined;
}
