// ---------------------------------------------------------------------------
// Static sample data.
//
// This build has no backend. Nothing here is fetched, saved, or changed at
// runtime — the arrays exist only so every screen has something to draw.
//
// Relations are plain id numbers, and the ids below line up with each other,
// so the lookup columns render real names instead of "#3".
//
// Timestamps carry no zone marker on purpose: they are read as local time both
// in the tables and in the datetime inputs, so the two always agree.
// ---------------------------------------------------------------------------

export const teachers = [
  {
    id: 1,
    name: "Amina Rahman",
    email: "amina.rahman@example.edu",
    subject: "Mathematics",
    is_active: true,
  },
  {
    id: 2,
    name: "Daniel Okoye",
    email: "daniel.okoye@example.edu",
    subject: "Physics",
    is_active: true,
  },
  {
    id: 3,
    name: "Priya Nair",
    email: "priya.nair@example.edu",
    subject: "Biology",
    is_active: true,
  },
  {
    id: 4,
    name: "Tomas Lindqvist",
    email: "tomas.lindqvist@example.edu",
    subject: "History",
    is_active: false,
  },
];

export const students = [
  {
    id: 1,
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    roll_number: "R-1001",
    enrollment_date: "2026-01-12",
    is_active: true,
  },
  {
    id: 2,
    name: "Liam Novak",
    email: "liam.novak@example.com",
    roll_number: "R-1002",
    enrollment_date: "2026-01-12",
    is_active: true,
  },
  {
    id: 3,
    name: "Chen Wei",
    email: "chen.wei@example.com",
    roll_number: "R-1003",
    enrollment_date: "2026-02-03",
    is_active: true,
  },
  {
    id: 4,
    name: "Fatima Zahra",
    email: "fatima.zahra@example.com",
    roll_number: "R-1004",
    enrollment_date: "2026-02-19",
    is_active: true,
  },
  {
    id: 5,
    name: "Noah Bennett",
    email: "noah.bennett@example.com",
    roll_number: "R-1005",
    enrollment_date: "2026-03-05",
    is_active: false,
  },
  {
    id: 6,
    name: "Ingrid Sole",
    email: "ingrid.sole@example.com",
    roll_number: "R-1006",
    enrollment_date: "2026-03-22",
    is_active: true,
  },
];

export const courses = [
  {
    id: 1,
    title: "Algebra I",
    description: "Linear equations, inequalities, and an intro to functions.",
    teacher: 1,
  },
  {
    id: 2,
    title: "Classical Mechanics",
    description: "Motion, forces, energy, and momentum for first-year students.",
    teacher: 2,
  },
  {
    id: 3,
    title: "Cell Biology",
    description: "Cell structure, division, and the basics of metabolism.",
    teacher: 3,
  },
  {
    id: 4,
    title: "Modern World History",
    description: "Political and social change from 1900 to the present day.",
    teacher: 4,
  },
];

export const lessons = [
  {
    id: 1,
    title: "Solving Linear Equations",
    description: "One-step and two-step equations, with worked examples.",
    course: 1,
  },
  {
    id: 2,
    title: "Graphing Functions",
    description: "Plotting straight lines and reading slope from a graph.",
    course: 1,
  },
  {
    id: 3,
    title: "Newton's Laws",
    description: "The three laws of motion and where each one applies.",
    course: 2,
  },
  {
    id: 4,
    title: "Conservation of Energy",
    description: "Kinetic and potential energy in closed systems.",
    course: 2,
  },
  {
    id: 5,
    title: "The Cell Membrane",
    description: "Structure of the bilayer and how transport works.",
    course: 3,
  },
  {
    id: 6,
    title: "The Interwar Years",
    description: "Europe between 1918 and 1939.",
    course: 4,
  },
];

export const enrollments = [
  { id: 1, student: 1, course: 1, enrollment_date: "2026-01-15" },
  { id: 2, student: 1, course: 2, enrollment_date: "2026-01-15" },
  { id: 3, student: 2, course: 1, enrollment_date: "2026-01-18" },
  { id: 4, student: 3, course: 3, enrollment_date: "2026-02-05" },
  { id: 5, student: 4, course: 4, enrollment_date: "2026-02-21" },
  { id: 6, student: 6, course: 2, enrollment_date: "2026-03-25" },
];

export const assignments = [
  {
    id: 1,
    title: "Equation Worksheet 1",
    description: "Twenty linear equations. Show every step of your working.",
    course: 1,
    lesson: 1,
    due_date: "2026-08-15T23:59:00",
  },
  {
    id: 2,
    title: "Slope and Intercept Problems",
    description: "Read the slope and intercept from six supplied graphs.",
    course: 1,
    lesson: 2,
    due_date: "2026-08-22T23:59:00",
  },
  {
    id: 3,
    title: "Force Diagrams",
    description: "Draw free-body diagrams for the five scenarios given.",
    course: 2,
    lesson: 3,
    due_date: "2026-08-18T17:00:00",
  },
  {
    id: 4,
    title: "Energy Lab Report",
    description: "Write up the pendulum experiment run in the lab session.",
    course: 2,
    lesson: 4,
    due_date: "2026-09-01T17:00:00",
  },
  {
    id: 5,
    title: "Membrane Transport Essay",
    description: "Compare passive diffusion with active transport in 800 words.",
    course: 3,
    lesson: 5,
    due_date: "2026-08-29T23:59:00",
  },
];

export const submissions = [
  {
    id: 1,
    assignment: 1,
    student: 1,
    content:
      "All twenty equations solved. Questions 14 and 17 needed the distributive law first.",
    submitted_at: "2026-08-14T19:22:00",
  },
  {
    id: 2,
    assignment: 1,
    student: 2,
    content: "Solved 18 of 20. I could not finish the last two in time.",
    submitted_at: "2026-08-15T22:47:00",
  },
  {
    id: 3,
    assignment: 2,
    student: 1,
    content: "Slope and intercept read off all six graphs, working attached.",
    submitted_at: "2026-08-20T10:05:00",
  },
  {
    id: 4,
    assignment: 3,
    student: 6,
    content:
      "Five free-body diagrams drawn. The inclined plane one was the hardest to get right.",
    submitted_at: "2026-08-17T14:30:00",
  },
  {
    id: 5,
    assignment: 5,
    student: 3,
    content:
      "Essay comparing passive diffusion and active transport, 812 words with references.",
    submitted_at: "2026-08-28T21:10:00",
  },
];

export const results = [
  {
    id: 1,
    submission: 1,
    score: 92.5,
    feedback: "Clear working throughout. Watch your sign changes in question 9.",
  },
  {
    id: 2,
    submission: 2,
    score: 78,
    feedback: "Good method, but two questions were left unanswered.",
  },
  {
    id: 3,
    submission: 4,
    score: 85,
    feedback: "Diagrams are accurate. Label the normal force on the incline.",
  },
  {
    id: 4,
    submission: 5,
    score: 88.5,
    feedback: "Strong comparison. The references section could be fuller.",
  },
];
