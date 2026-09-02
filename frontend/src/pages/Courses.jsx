import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { coursesApi, teachersApi } from "../api.js";
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

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
  const mayCreate = canCreate(user?.role, "course");
  const mayEdit = canWrite(user?.role, "course");
  const [isSaving, setIsSaving] = useState(false);

  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [description, setDescription] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // Bumping this re-runs both effects below. Saving and deleting call
  // reload() so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  // One page of courses, re-read whenever the search box, the sort or the
  // page number changes.
  useEffect(() => {
    let isCurrent = true;

    async function load() {
      setIsLoading(true);

      try {
        const body = await coursesApi.list(queryParams);
        if (!isCurrent) {
          return;
        }
        setCourses(body.results);
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

  // The teacher list is only wanted for the two dropdowns — the one in the
  // form and the one in the filter bar. The name against each row comes off
  // the row itself as `teacher_name`, so no join is done here. Its own effect,
  // so that turning a page does not re-read it.
  useEffect(() => {
    async function loadTeachers() {
      try {
        setTeachers(await teachersApi.listAll({ ordering: "name" }));
      } catch (problem) {
        setError(problem.message);
      }
    }

    loadTeachers();
  }, [reloadCount]);

  function openEmptyForm() {
    setTitle("");
    setTeacherId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(course) {
    setTitle(course.title);
    setTeacherId(String(course.teacher));
    setDescription(course.description);
    setEditingId(course.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    // A <select> always hands back a string. The API wants the integer id.
    const values = { title, description, teacher: Number(teacherId) };

    try {
      if (editingId === 0) {
        await coursesApi.create(values);
        setNotice("Course added.");
      } else {
        await coursesApi.update(editingId, values);
        setNotice("Course updated.");
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

  function askToDelete(course) {
    setCourseToDelete(course);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await coursesApi.remove(courseToDelete.id);
      setError("");
      setNotice("Course deleted.");
      setCourseToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setCourseToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Courses" subtitle="Every course, and who teaches it." />

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
              {editingId === 0 ? "New course" : "Edit course"}
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
              label="Teacher"
              placeholder="Choose a teacher..."
              required
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
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
              : `${count} ${count === 1 ? "course" : "courses"}`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add course
            </Button>
          )}
        </div>

        <FilterBar
          search={query.searchBox}
          onSearchChange={query.setSearchBox}
          placeholder="Title, description or teacher"
          isFiltered={query.isFiltered}
          onClear={query.clear}
        >
          <Select
            label="Teacher"
            className="min-w-48"
            value={query.filters.teacher ?? ""}
            onChange={(event) => query.setFilter("teacher", event.target.value)}
          >
            <option value="">Any teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Select>
        </FilterBar>

        <Table
          columns={[
            { label: "ID", field: "id" },
            { label: "Title", field: "title" },
            "Description",
            { label: "Teacher", field: "teacher__name" },
            "Action",
          ]}
          ordering={query.ordering}
          onSort={query.toggleSort}
          isEmpty={!isLoading && courses.length === 0}
          emptyMessage={
            query.isFiltered
              ? "No course matches those filters."
              : "No courses yet."
          }
        >
          {courses.map((course) => (
            <tr
              key={course.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{course.id}</td>
              <td className="px-3 py-2 text-slate-700">{course.title}</td>
              <td className="px-3 py-2 text-slate-700">
                <span className="block max-w-xs truncate">
                  {course.description}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-700">
                {course.teacher_name}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(course)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(course)}
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
        open={courseToDelete !== null}
        title="Delete course"
        message={`Delete ${courseToDelete?.title}? Its lessons, assignments and enrollments go too. This cannot be undone.`}
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setCourseToDelete(null)}
      />
    </div>
  );
}
