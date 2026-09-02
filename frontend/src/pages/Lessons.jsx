import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { coursesApi, lessonsApi } from "../api.js";
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

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
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
  const mayCreate = canCreate(user?.role, "lesson");
  const mayEdit = canWrite(user?.role, "lesson");
  const [isSaving, setIsSaving] = useState(false);

  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // Bumping this re-runs both effects below. Saving and deleting call
  // reload() so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  // "Lessons in course 3" is now a request the server can answer: it is
  // ?course=3, which the Course dropdown below sets.
  useEffect(() => {
    let isCurrent = true;

    async function load() {
      setIsLoading(true);

      try {
        const body = await lessonsApi.list(queryParams);
        if (!isCurrent) {
          return;
        }
        setLessons(body.results);
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

  // The course list is only wanted for the two dropdowns. Each row carries
  // its own `course_title`, so nothing is joined here. Read once, rather than
  // on every page turn.
  useEffect(() => {
    async function loadCourses() {
      try {
        setCourses(await coursesApi.listAll({ ordering: "title" }));
      } catch (problem) {
        setError(problem.message);
      }
    }

    loadCourses();
  }, [reloadCount]);

  function openEmptyForm() {
    setTitle("");
    setCourseId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(lesson) {
    setTitle(lesson.title);
    setCourseId(String(lesson.course));
    setDescription(lesson.description);
    setEditingId(lesson.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    const values = { title, description, course: Number(courseId) };

    try {
      if (editingId === 0) {
        await lessonsApi.create(values);
        setNotice("Lesson added.");
      } else {
        await lessonsApi.update(editingId, values);
        setNotice("Lesson updated.");
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

  function askToDelete(lesson) {
    setLessonToDelete(lesson);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await lessonsApi.remove(lessonToDelete.id);
      setError("");
      setNotice("Lesson deleted.");
      setLessonToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setLessonToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Lessons"
        subtitle="The lessons that make up each course."
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
              {editingId === 0 ? "New lesson" : "Edit lesson"}
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
              : `${count} ${count === 1 ? "lesson" : "lessons"}`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add lesson
            </Button>
          )}
        </div>

        <FilterBar
          search={query.searchBox}
          onSearchChange={query.setSearchBox}
          placeholder="Title, description or course"
          isFiltered={query.isFiltered}
          onClear={query.clear}
        >
          <Select
            label="Course"
            className="min-w-48"
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
        </FilterBar>

        <Table
          columns={[
            { label: "ID", field: "id" },
            { label: "Title", field: "title" },
            "Description",
            { label: "Course", field: "course__title" },
            "Action",
          ]}
          ordering={query.ordering}
          onSort={query.toggleSort}
          isEmpty={!isLoading && lessons.length === 0}
          emptyMessage={
            query.isFiltered
              ? "No lesson matches those filters."
              : "No lessons yet."
          }
        >
          {lessons.map((lesson) => (
            <tr
              key={lesson.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{lesson.id}</td>
              <td className="px-3 py-2 text-slate-700">{lesson.title}</td>
              <td className="px-3 py-2 text-slate-700">
                <span className="block max-w-xs truncate">
                  {lesson.description}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-700">
                {lesson.course_title}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(lesson)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(lesson)}
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
        open={lessonToDelete !== null}
        title="Delete lesson"
        message={`Delete ${lessonToDelete?.title}? Its assignments go too. This cannot be undone.`}
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setLessonToDelete(null)}
      />
    </div>
  );
}
