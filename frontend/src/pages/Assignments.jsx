import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignmentsApi, coursesApi, lessonsApi } from "../api.js";
import { useAuth } from "../auth.js";
import { canCreate, canWrite } from "../permissions.js";
import useTableQuery from "../useTableQuery.js";
import {
  Alert,
  Button,
  ConfirmDialog,
  FilterBar,
  IconButton,
  Input,
  PageHeader,
  Pagination,
  Select,
  Table,
  Textarea,
} from "../components/index.js";

function showDateAndTime(text) {
  if (!text) {
    return "";
  }
  return new Date(text).toLocaleString();
}

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time, but
// the API sends UTC ("2026-08-15T23:59:00Z"). Slicing the string straight
// off would show the UTC clock time, so the offset is taken off first.
function toDateTimeInputValue(text) {
  if (!text) {
    return "";
  }
  const moment = new Date(text);
  const offsetInMs = moment.getTimezoneOffset() * 60 * 1000;
  return new Date(moment.getTime() - offsetInMs).toISOString().slice(0, 16);
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const query = useTableQuery({ ordering: "id" });
  const { params: queryParams, stepBackAfter } = query;

  // The server enforces this too. Hiding the buttons just keeps the page
  // honest about what will actually work.
  const { user } = useAuth();
  const mayCreate = canCreate(user?.role, "assignment");
  const mayEdit = canWrite(user?.role, "assignment");
  const [isSaving, setIsSaving] = useState(false);

  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [description, setDescription] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // An assignment points at both a course and a lesson, so once a course is
  // chosen only that course's lessons are worth offering.
  const lessonsToOffer = courseId
    ? lessons.filter((lesson) => lesson.course === Number(courseId))
    : lessons;

  // The same narrowing for the filter bar, which has its own course dropdown.
  const filterCourseId = query.filters.course ?? "";
  const lessonsToFilterBy = filterCourseId
    ? lessons.filter((lesson) => lesson.course === Number(filterCourseId))
    : lessons;

  // Bumping this re-runs both effects below. Saving and deleting call
  // reload() so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      setIsLoading(true);

      try {
        const body = await assignmentsApi.list(queryParams);
        if (!isCurrent) {
          return;
        }
        setAssignments(body.results);
        setCount(body.count);
        setTotalPages(body.total_pages);
        setError("");
      } catch (problem) {
        if (!isCurrent) {
          return;
        }
        if (stepBackAfter(problem)) {
          return;
        }
        setError(problem.message);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCurrent = false;
    };
  }, [reloadCount, queryParams, stepBackAfter]);

  // Courses and lessons in full, for the dropdowns in the form and the filter
  // bar, and to narrow the lesson list to one course. The titles in the table
  // come off each row, so nothing is joined here.
  useEffect(() => {
    async function loadLookups() {
      try {
        const [courseRows, lessonRows] = await Promise.all([
          coursesApi.listAll({ ordering: "title" }),
          lessonsApi.listAll({ ordering: "title" }),
        ]);
        setCourses(courseRows);
        setLessons(lessonRows);
      } catch (problem) {
        setError(problem.message);
      }
    }

    loadLookups();
  }, [reloadCount]);

  function openEmptyForm() {
    setTitle("");
    setDueDate("");
    setCourseId("");
    setLessonId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(assignment) {
    setTitle(assignment.title);
    setDueDate(toDateTimeInputValue(assignment.due_date));
    setCourseId(String(assignment.course));
    setLessonId(String(assignment.lesson));
    setDescription(assignment.description);
    setEditingId(assignment.id);
    setFormIsOpen(true);
  }

  // Changing the course clears a lesson that no longer belongs to it.
  function handleCourseChange(nextCourseId) {
    setCourseId(nextCourseId);

    const lesson = lessons.find((item) => item.id === Number(lessonId));
    if (lesson && lesson.course !== Number(nextCourseId)) {
      setLessonId("");
    }
  }

  // The same again for the filter bar: narrowing to a course would otherwise
  // leave a lesson filter in place that no row can satisfy, and the table
  // would go empty for no visible reason.
  function handleCourseFilterChange(nextCourseId) {
    const lesson = lessons.find(
      (item) => item.id === Number(query.filters.lesson),
    );
    if (lesson && lesson.course !== Number(nextCourseId)) {
      query.setFilter("lesson", "");
    }
    query.setFilter("course", nextCourseId);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      // toISOString() throws on an unparseable date, so this has to happen
      // inside the try or the button would stay stuck on "Saving...".
      const due = new Date(dueDate);
      if (Number.isNaN(due.getTime())) {
        throw new Error("Enter a due date.");
      }

      const values = {
        title,
        description,
        course: Number(courseId),
        lesson: Number(lessonId),
        // The input gives local time. Send UTC so the server stores the
        // moment that was actually meant.
        due_date: due.toISOString(),
      };

      if (editingId === 0) {
        await assignmentsApi.create(values);
        setNotice("Assignment added.");
      } else {
        await assignmentsApi.update(editingId, values);
        setNotice("Assignment updated.");
      }
      setError("");
      closeForm();
      reload();
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
  }

  function askToDelete(assignment) {
    setAssignmentToDelete(assignment);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await assignmentsApi.remove(assignmentToDelete.id);
      setError("");
      setNotice("Assignment deleted.");
      setAssignmentToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setAssignmentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Work set against a lesson." />

      <Alert
        className="ml-auto w-fit max-w-md"
        onDismiss={() => setError("")}
      >
        {error}
      </Alert>
      <Alert
        variant="success"
        className="ml-auto w-fit max-w-md"
        onDismiss={() => setNotice("")}
      >
        {notice}
      </Alert>

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New assignment" : "Edit assignment"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Input
              label="Due date"
              type="datetime-local"
              required
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />

            <Select
              label="Course"
              placeholder="Choose a course..."
              required
              value={courseId}
              onChange={(event) => handleCourseChange(event.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>

            <Select
              label="Lesson"
              placeholder="Choose a lesson..."
              required
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
            >
              {lessonsToOffer.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Description"
            className="mt-4"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {isLoading
              ? "Loading..."
              : `${count} ${count === 1 ? "assignment" : "assignments"}`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add assignment
            </Button>
          )}
        </div>

        <FilterBar
          search={query.searchBox}
          onSearchChange={query.setSearchBox}
          placeholder="Title, description, course or lesson"
          isFiltered={query.isFiltered}
          onClear={query.clear}
        >
          <Select
            label="Course"
            className="min-w-44"
            value={filterCourseId}
            onChange={(event) => handleCourseFilterChange(event.target.value)}
          >
            <option value="">Any course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </Select>

          <Select
            label="Lesson"
            className="min-w-44"
            value={query.filters.lesson ?? ""}
            onChange={(event) => query.setFilter("lesson", event.target.value)}
          >
            <option value="">Any lesson</option>
            {lessonsToFilterBy.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </Select>

          {/* Due dates carry a time, but picking one to the minute is not how
              anyone thinks about "due this week", so these are plain dates. */}
          <Input
            label="Due from"
            type="date"
            className="min-w-40"
            value={query.filters.due_from ?? ""}
            onChange={(event) => query.setFilter("due_from", event.target.value)}
          />

          <Input
            label="Due to"
            type="date"
            className="min-w-40"
            value={query.filters.due_to ?? ""}
            onChange={(event) => query.setFilter("due_to", event.target.value)}
          />
        </FilterBar>

        <Table
          columns={[
            { label: "ID", field: "id" },
            { label: "Title", field: "title" },
            { label: "Course", field: "course__title" },
            { label: "Lesson", field: "lesson__title" },
            { label: "Due", field: "due_date" },
            "Action",
          ]}
          ordering={query.ordering}
          onSort={query.toggleSort}
          isEmpty={!isLoading && assignments.length === 0}
          emptyMessage={
            query.isFiltered
              ? "No assignment matches those filters."
              : "No assignments yet."
          }
        >
          {assignments.map((assignment) => (
            <tr
              key={assignment.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{assignment.id}</td>
              <td className="px-3 py-2 text-slate-700">{assignment.title}</td>
              <td className="px-3 py-2 text-slate-700">
                {assignment.course_title}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {assignment.lesson_title}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {showDateAndTime(assignment.due_date)}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(assignment)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(assignment)}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </>
                  ) : (
                    <span className="px-2 text-slate-400">&mdash;</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination
          page={query.page}
          pageSize={query.pageSize}
          count={count}
          totalPages={totalPages}
          onPageChange={query.setPage}
          onPageSizeChange={query.setPageSize}
        />
      </div>

      <ConfirmDialog
        open={assignmentToDelete !== null}
        title="Delete assignment"
        message={`Delete ${assignmentToDelete?.title}? Its submissions go too. This cannot be undone.`}
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setAssignmentToDelete(null)}
      />
    </div>
  );
}
