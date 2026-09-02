import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { coursesApi, enrollmentsApi, studentsApi } from "../api.js";
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
} from "../components/index.js";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
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
  const mayCreate = canCreate(user?.role, "enrollment");
  const mayEdit = canWrite(user?.role, "enrollment");
  const [isSaving, setIsSaving] = useState(false);

  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // Bumping this re-runs both effects below. Saving and deleting call
  // reload() so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  // One page of enrollments. ?search= reaches the student's name and the
  // course title through the relations, so searching "algebra" works even
  // though an enrollment row carries only ids.
  useEffect(() => {
    let isCurrent = true;

    async function load() {
      setIsLoading(true);

      try {
        const body = await enrollmentsApi.list(queryParams);
        if (!isCurrent) {
          return;
        }
        setEnrollments(body.results);
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

  // Students and courses in full, for the dropdowns in the form and the
  // filter bar. The names in the table come off each row as `student_name`
  // and `course_title`, so nothing is joined here.
  useEffect(() => {
    async function loadLookups() {
      try {
        const [studentRows, courseRows] = await Promise.all([
          studentsApi.listAll({ ordering: "name" }),
          coursesApi.listAll({ ordering: "title" }),
        ]);
        setStudents(studentRows);
        setCourses(courseRows);
      } catch (problem) {
        setError(problem.message);
      }
    }

    loadLookups();
  }, [reloadCount]);

  function openEmptyForm() {
    setStudentId("");
    setCourseId("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(enrollment) {
    setStudentId(String(enrollment.student));
    setCourseId(String(enrollment.course));
    setEditingId(enrollment.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    // enrollment_date is auto_now_add on the server. Sending it is silently
    // ignored, so it is shown in the table but never in the form.
    const values = { student: Number(studentId), course: Number(courseId) };

    try {
      if (editingId === 0) {
        await enrollmentsApi.create(values);
        setNotice("Enrollment added.");
      } else {
        await enrollmentsApi.update(editingId, values);
        setNotice("Enrollment updated.");
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

  function askToDelete(enrollment) {
    setEnrollmentToDelete(enrollment);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await enrollmentsApi.remove(enrollmentToDelete.id);
      setError("");
      setNotice("Enrollment deleted.");
      setEnrollmentToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setEnrollmentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Which student is taking which course."
      />

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
              {editingId === 0 ? "New enrollment" : "Edit enrollment"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Student"
              placeholder="Choose a student..."
              required
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </Select>

            <Select
              label="Course"
              placeholder="Choose a course..."
              required
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
          </div>

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
              : `${count} ${count === 1 ? "enrollment" : "enrollments"}`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add enrollment
            </Button>
          )}
        </div>

        <FilterBar
          search={query.searchBox}
          onSearchChange={query.setSearchBox}
          placeholder="Student, roll number or course"
          isFiltered={query.isFiltered}
          onClear={query.clear}
        >
          <Select
            label="Student"
            className="min-w-44"
            value={query.filters.student ?? ""}
            onChange={(event) => query.setFilter("student", event.target.value)}
          >
            <option value="">Any student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </Select>

          <Select
            label="Course"
            className="min-w-44"
            value={query.filters.course ?? ""}
            onChange={(event) => query.setFilter("course", event.target.value)}
          >
            <option value="">Any course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </Select>

          <Input
            label="Enrolled from"
            type="date"
            className="min-w-40"
            value={query.filters.enrolled_from ?? ""}
            onChange={(event) =>
              query.setFilter("enrolled_from", event.target.value)
            }
          />

          <Input
            label="Enrolled to"
            type="date"
            className="min-w-40"
            value={query.filters.enrolled_to ?? ""}
            onChange={(event) =>
              query.setFilter("enrolled_to", event.target.value)
            }
          />
        </FilterBar>

        <Table
          columns={[
            { label: "ID", field: "id" },
            { label: "Student", field: "student__name" },
            { label: "Course", field: "course__title" },
            { label: "Enrolled", field: "enrollment_date" },
            "Action",
          ]}
          ordering={query.ordering}
          onSort={query.toggleSort}
          isEmpty={!isLoading && enrollments.length === 0}
          emptyMessage={
            query.isFiltered
              ? "No enrollment matches those filters."
              : "No enrollments yet."
          }
        >
          {enrollments.map((enrollment) => (
            <tr
              key={enrollment.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{enrollment.id}</td>
              <td className="px-3 py-2 text-slate-700">
                {enrollment.student_name}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {enrollment.course_title}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {enrollment.enrollment_date}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(enrollment)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(enrollment)}
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
        open={enrollmentToDelete !== null}
        title="Delete enrollment"
        message={
          enrollmentToDelete
            ? `Take ${enrollmentToDelete.student_name} off ${enrollmentToDelete.course_title}? This cannot be undone.`
            : ""
        }
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setEnrollmentToDelete(null)}
      />
    </div>
  );
}
