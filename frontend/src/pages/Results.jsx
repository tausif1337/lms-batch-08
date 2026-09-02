import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  assignmentsApi,
  resultsApi,
  studentsApi,
  submissionsApi,
} from "../api.js";
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

function shorten(text) {
  if (!text) {
    return "";
  }
  if (text.length > 60) {
    return text.slice(0, 60) + "...";
  }
  return text;
}

export default function Results() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // The submissions offered in the "new result" dropdown, and how many there
  // are in total. Only the ungraded ones, and only the first pageful: see the
  // effect that loads them.
  const [ungraded, setUngraded] = useState([]);
  const [ungradedCount, setUngradedCount] = useState(0);
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
  const mayCreate = canCreate(user?.role, "results");
  const mayEdit = canWrite(user?.role, "results");
  const [isSaving, setIsSaving] = useState(false);

  const [resultToDelete, setResultToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [submissionId, setSubmissionId] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // "Submission #4" on its own says nothing useful, so the label carries the
  // student and the assignment. Both a result row and a submission row are
  // sent with those names on them, so this is a format and not a lookup.
  function describe(row, submissionId) {
    const who = row?.student_name ?? "Unknown student";
    const what = row?.assignment_title ?? "Unknown assignment";
    return `#${submissionId} — ${who}, ${what}`;
  }

  // The submission being edited is already graded, so it is not in the
  // ungraded list — and without this its own row would show as blank.
  const editingRow = results.find((result) => result.id === editingId);

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
        const body = await resultsApi.list(queryParams);
        if (!isCurrent) {
          return;
        }
        setResults(body.results);
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

  // Results.submission is one-to-one: a submission can only be graded once,
  // and a second attempt comes back as a 400. So the dropdown is built from
  // ?ungraded=true, which is the server answering "no result attached yet"
  // from the database.
  //
  // Only the first pageful of those. There are thousands of submissions here
  // and a <select> is no way to hunt through them; the count below the box
  // says how many are waiting, and grading one brings the next into view.
  const UNGRADED_TO_OFFER = 200;

  useEffect(() => {
    async function loadLookups() {
      try {
        const [ungradedPage, studentRows, assignmentRows] = await Promise.all([
          submissionsApi.list({
            ungraded: "true",
            ordering: "submitted_at",
            page_size: UNGRADED_TO_OFFER,
          }),
          studentsApi.listAll({ ordering: "name" }),
          assignmentsApi.listAll({ ordering: "title" }),
        ]);
        setUngraded(ungradedPage.results);
        setUngradedCount(ungradedPage.count);
        setStudents(studentRows);
        setAssignments(assignmentRows);
      } catch (problem) {
        setError(problem.message);
      }
    }

    loadLookups();
  }, [reloadCount]);

  function openEmptyForm() {
    setSubmissionId("");
    setScore("");
    setFeedback("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(result) {
    setSubmissionId(String(result.submission));
    setScore(String(result.score));
    setFeedback(result.feedback);
    setEditingId(result.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    const values = {
      submission: Number(submissionId),
      score: Number(score),
      feedback,
    };

    try {
      if (editingId === 0) {
        await resultsApi.create(values);
        setNotice("Result added.");
      } else {
        await resultsApi.update(editingId, values);
        setNotice("Result updated.");
      }
      setError("");
      closeForm();
      reload();
    } catch (problem) {
      // The one-to-one clash comes back as "submission: results with this
      // submission already exists", which reads badly. Say it plainly.
      if (problem.message.includes("already exists")) {
        setError("That submission has already been graded. Edit its result instead.");
      } else {
        setError(problem.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function askToDelete(result) {
    setResultToDelete(result);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await resultsApi.remove(resultToDelete.id);
      setError("");
      setNotice("Result deleted.");
      setResultToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setResultToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Scores and feedback for submitted work."
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
              {editingId === 0 ? "New result" : "Edit result"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Submission"
              placeholder="Choose a submission..."
              required
              value={submissionId}
              onChange={(event) => setSubmissionId(event.target.value)}
            >
              {/* The row being edited first, since it is not on the
                  ungraded list and would otherwise show as blank. */}
              {editingRow && (
                <option value={editingRow.submission}>
                  {describe(editingRow, editingRow.submission)}
                </option>
              )}

              {ungraded.map((submission) => (
                <option key={submission.id} value={submission.id}>
                  {describe(submission, submission.id)}
                </option>
              ))}
            </Select>

            <Input
              label="Score"
              type="number"
              step="0.01"
              required
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>

          {ungradedCount > UNGRADED_TO_OFFER && (
            <p className="mt-2 text-sm text-slate-500">
              Showing the {UNGRADED_TO_OFFER} longest-waiting of{" "}
              {ungradedCount} ungraded submissions. Grade these and the rest
              move up.
            </p>
          )}

          <Textarea
            label="Feedback"
            className="mt-4"
            required
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
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
              : `${count} ${count === 1 ? "result" : "results"}`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add result
            </Button>
          )}
        </div>

        <FilterBar
          search={query.searchBox}
          onSearchChange={query.setSearchBox}
          placeholder="Feedback, student or assignment"
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
            label="Assignment"
            className="min-w-44"
            value={query.filters.assignment ?? ""}
            onChange={(event) =>
              query.setFilter("assignment", event.target.value)
            }
          >
            <option value="">Any assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </Select>

          {/* "Everyone who scored under 40" is the question behind these two,
              so they are a pair the same way the date ranges are. */}
          <Input
            label="Score from"
            type="number"
            step="0.01"
            className="min-w-32"
            value={query.filters.score_min ?? ""}
            onChange={(event) => query.setFilter("score_min", event.target.value)}
          />

          <Input
            label="Score to"
            type="number"
            step="0.01"
            className="min-w-32"
            value={query.filters.score_max ?? ""}
            onChange={(event) => query.setFilter("score_max", event.target.value)}
          />
        </FilterBar>

        <Table
          columns={[
            { label: "ID", field: "id" },
            { label: "Submission", field: "submission__student__name" },
            { label: "Score", field: "score" },
            "Feedback",
            "Action",
          ]}
          ordering={query.ordering}
          onSort={query.toggleSort}
          isEmpty={!isLoading && results.length === 0}
          emptyMessage={
            query.isFiltered
              ? "No result matches those filters."
              : "Nothing graded yet."
          }
        >
          {results.map((result) => (
            <tr
              key={result.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{result.id}</td>
              <td className="px-3 py-2 text-slate-700">
                {describe(result, result.submission)}
              </td>
              <td className="px-3 py-2 text-slate-700">{result.score}</td>
              <td className="px-3 py-2 text-slate-700">
                {shorten(result.feedback)}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(result)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(result)}
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
        open={resultToDelete !== null}
        title="Delete result"
        message={
          resultToDelete
            ? `Delete the result for ${describe(resultToDelete, resultToDelete.submission)}? The submission can then be graded again. This cannot be undone.`
            : ""
        }
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setResultToDelete(null)}
      />
    </div>
  );
}
