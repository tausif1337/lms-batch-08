// A copy of the rules in backend/permissions.py, used only to decide which
// buttons are worth showing. The server is what actually enforces them, so a
// mistake here is a cosmetic bug, not a hole. Keep the two in step.

export const ADMIN = "admin";
export const TEACHER = "teacher";
export const STUDENT = "student";

const WRITERS = {
  teacher: [ADMIN],
  student: [ADMIN],
  course: [ADMIN, TEACHER],
  enrollment: [ADMIN, TEACHER],
  lesson: [ADMIN, TEACHER],
  assignment: [ADMIN, TEACHER],
  submission: [ADMIN, TEACHER],
  results: [ADMIN, TEACHER],
};

// May this role change or remove rows of this kind?
export function canWrite(role, resource) {
  return (WRITERS[resource] ?? []).includes(role);
}

// May this role add a new row? Same as canWrite everywhere except submissions,
// which a student is allowed to hand in but not to edit afterwards.
export function canCreate(role, resource) {
  if (resource === "submission" && role === STUDENT) {
    return true;
  }
  return canWrite(role, resource);
}

const LABELS = {
  [ADMIN]: "Admin",
  [TEACHER]: "Teacher",
  [STUDENT]: "Student",
};

export function roleLabel(role) {
  return LABELS[role] ?? "No role";
}
