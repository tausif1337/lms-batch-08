import { useEffect, useMemo, useState } from "react";
import { Eye, Inbox, Loader2, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { ErrorMessage } from "../components/Message.jsx";
import { addToList, deleteFromList, getList, updateInList } from "../api.js";
import { getLoggedInUser } from "../auth.js";

const LINKED_LIST_FOR_EACH_FIELD = {
  teacher: { listName: "teachers", describe: record => record.name || `Teacher #${record.id}` },
  student: { listName: "students", describe: record => record.name || `Student #${record.id}` },
  course: { listName: "courses", describe: record => record.title || `Course #${record.id}` },
  lesson: { listName: "lessons", describe: record => record.title || `Lesson #${record.id}` },
  assignment: {
    listName: "assignments",
    describe: record => record.title || `Assignment #${record.id}`,
  },
  submission: { listName: "submissions", describe: record => `Submission #${record.id}` },
};

const PAGE_SETTINGS = {
  teachers: {
    title: "Teachers",
    oneRecordIsCalled: "Teacher",
    formFields: ["name", "email", "subject", "is_active"],
    rolesThatCanAdd: ["admin"],
    rolesThatCanEditAndDelete: ["admin"],
  },
  students: {
    title: "Students",
    oneRecordIsCalled: "Student",
    formFields: ["name", "email", "enrollment_date", "is_active", "roll_number"],
    tableColumns: ["account", "name", "email", "enrollment_date", "is_active", "roll_number"],
    rolesThatCanAdd: ["admin"],
    rolesThatCanEditAndDelete: ["admin"],
  },
  courses: {
    title: "Courses",
    oneRecordIsCalled: "Course",
    formFields: ["title", "description", "teacher"],
    rolesThatCanAdd: ["admin", "teacher"],
    rolesThatCanEditAndDelete: ["admin", "teacher"],
  },
  enrollments: {
    title: "Enrollments",
    oneRecordIsCalled: "Enrollment",
    formFields: ["student", "course"],
    tableColumns: ["student", "course", "enrollment_date"],
    rolesThatCanAdd: ["admin", "teacher"],
    rolesThatCanEditAndDelete: ["admin", "teacher"],
  },
  lessons: {
    title: "Lessons",
    oneRecordIsCalled: "Lesson",
    formFields: ["title", "description", "course"],
    rolesThatCanAdd: ["admin", "teacher"],
    rolesThatCanEditAndDelete: ["admin", "teacher"],
  },
  assignments: {
    title: "Assignments",
    oneRecordIsCalled: "Assignment",
    formFields: ["title", "description", "lesson", "course", "due_date"],
    rolesThatCanAdd: ["admin", "teacher"],
    rolesThatCanEditAndDelete: ["admin", "teacher"],
  },
  submissions: {
    title: "Submissions",
    oneRecordIsCalled: "Submission",
    formFields: ["assignment", "student", "content"],
    tableColumns: ["assignment", "student", "content", "submitted_at"],
    rolesThatCanAdd: ["admin", "teacher", "student"],
    rolesThatCanEditAndDelete: ["admin", "teacher"],
    fieldsTheServerFillsInForRole: { student: ["student"] },
  },
  results: {
    title: "Results",
    oneRecordIsCalled: "Result",
    formFields: ["submission", "score", "feedback"],
    rolesThatCanAdd: ["admin", "teacher"],
    rolesThatCanEditAndDelete: ["admin", "teacher"],
  },
};

const NICER_TITLE_FOR_FIELD = {
  is_active: "Active",
  due_date: "Due date",
  roll_number: "Roll number",
  enrollment_date: "Enrolled on",
  submitted_at: "Submitted at",
  account: "Account",
};

const LONG_TEXT_FIELDS = ["description", "content", "feedback"];
const DATE_AND_TIME_FIELDS = ["due_date", "submitted_at"];

function titleFor(fieldName) {
  if (NICER_TITLE_FOR_FIELD[fieldName]) {
    return NICER_TITLE_FOR_FIELD[fieldName];
  }

  const withSpaces = fieldName.replaceAll("_", " ");

  return withSpaces.replace(/\b\w/g, letter => letter.toUpperCase());
}

function emptyForm(fieldNames) {
  const startingValues = {};

  fieldNames.forEach(fieldName => {
    startingValues[fieldName] = fieldName === "is_active" ? true : "";
  });

  return startingValues;
}

function recordsFrom(answer) {
  if (Array.isArray(answer)) {
    return answer;
  }

  return answer?.results || [];
}

async function waitWithoutThrowing(promise) {
  try {
    return { worked: true, value: await promise };
  } catch (failure) {
    return { worked: false, failure };
  }
}

function twoDigits(number) {
  return String(number).padStart(2, "0");
}

function toDateTimeBoxValue(serverValue) {
  if (!serverValue) {
    return "";
  }

  const moment = new Date(serverValue);

  if (Number.isNaN(moment.getTime())) {
    return String(serverValue).slice(0, 16);
  }

  const day = `${moment.getFullYear()}-${twoDigits(moment.getMonth() + 1)}-${twoDigits(moment.getDate())}`;
  const time = `${twoDigits(moment.getHours())}:${twoDigits(moment.getMinutes())}`;

  return `${day}T${time}`;
}

function toServerDateTime(boxValue) {
  if (!boxValue) {
    return boxValue;
  }

  const moment = new Date(boxValue);

  if (Number.isNaN(moment.getTime())) {
    return boxValue;
  }

  return moment.toISOString();
}

async function loadChoicesForFields(fieldNames) {
  const choices = {};

  await Promise.all(
    fieldNames.map(async fieldName => {
      try {
        const answer = await getList(LINKED_LIST_FOR_EACH_FIELD[fieldName].listName);
        choices[fieldName] = { records: recordsFrom(answer), couldNotLoad: false };
      } catch {
        choices[fieldName] = { records: [], couldNotLoad: true };
      }
    }),
  );

  return choices;
}

function FormBox({ fieldName, value, choices, onChange }) {
  const boxStyle =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  if (LINKED_LIST_FOR_EACH_FIELD[fieldName]) {
    const records = choices?.records || [];
    const thingName = titleFor(fieldName).toLowerCase();

    let firstOptionText = `Select ${thingName}`;

    if (!choices) {
      firstOptionText = "Loading...";
    } else if (choices.couldNotLoad) {
      firstOptionText = `Could not load ${thingName}s`;
    } else if (records.length === 0) {
      firstOptionText = `No ${thingName}s yet — add one first`;
    }

    return (
      <select
        required
        disabled={records.length === 0}
        value={value ?? ""}
        onChange={event => onChange(event.target.value)}
        className={`${boxStyle} disabled:bg-slate-50 disabled:text-slate-500`}
      >
        <option value="">{firstOptionText}</option>
        {records.map(record => (
          <option key={record.id} value={record.id}>
            {LINKED_LIST_FOR_EACH_FIELD[fieldName].describe(record)}
          </option>
        ))}
      </select>
    );
  }

  if (fieldName === "is_active") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={event => onChange(event.target.checked)}
        className="mt-3 h-4 w-4"
      />
    );
  }

  if (LONG_TEXT_FIELDS.includes(fieldName)) {
    return (
      <textarea
        required
        rows="3"
        value={value}
        onChange={event => onChange(event.target.value)}
        className={boxStyle}
      />
    );
  }

  if (fieldName === "score") {
    return (
      <input
        required
        type="number"
        step="any"
        min="0"
        value={value}
        onChange={event => onChange(event.target.value)}
        className={boxStyle}
      />
    );
  }

  if (fieldName === "due_date") {
    return (
      <input
        required
        type="datetime-local"
        value={value}
        onChange={event => onChange(event.target.value)}
        className={boxStyle}
      />
    );
  }

  let boxType = "text";

  if (fieldName.includes("date")) {
    boxType = "date";
  } else if (fieldName === "email") {
    boxType = "email";
  }

  return (
    <input
      required={fieldName !== "roll_number"}
      type={boxType}
      value={value}
      onChange={event => onChange(event.target.value)}
      className={boxStyle}
    />
  );
}

function RecordForm({
  oneRecordIsCalled,
  fieldNames,
  form,
  choicesForEachField,
  isEditing,
  isSaving,
  onChangeOneBox,
  onCancelEditing,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">
          {isEditing ? `Edit ${oneRecordIsCalled}` : `Add ${oneRecordIsCalled}`}
        </h3>

        {isEditing && (
          <button
            type="button"
            onClick={onCancelEditing}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fieldNames.map(fieldName => (
          <label key={fieldName} className="text-sm font-medium text-slate-700">
            {titleFor(fieldName)}
            <FormBox
              fieldName={fieldName}
              value={form[fieldName]}
              choices={choicesForEachField[fieldName]}
              onChange={newValue => onChangeOneBox(fieldName, newValue)}
            />
          </label>
        ))}
      </div>

      <button
        disabled={isSaving}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSaving && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        )}
        {!isSaving && isEditing && (
          <>
            <Save className="h-4 w-4" />
            Save changes
          </>
        )}
        {!isSaving && !isEditing && (
          <>
            <Plus className="h-4 w-4" />
            Create
          </>
        )}
      </button>
    </form>
  );
}

function WholeWidthRow({ columnCount, children }) {
  return (
    <tr>
      <td colSpan={columnCount} className="px-4 py-10 text-center text-slate-500">
        {children}
      </td>
    </tr>
  );
}

function RecordsTable({
  columnNames,
  records,
  isLoading,
  canEditAndDelete,
  textForCell,
  onEdit,
  onDelete,
}) {
  const columnCount = columnNames.length + (canEditAndDelete ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {columnNames.map(columnName => (
                <th key={columnName} className="px-4 py-3">
                  {titleFor(columnName)}
                </th>
              ))}
              {canEditAndDelete && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y">
            {isLoading && (
              <WholeWidthRow columnCount={columnCount}>
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              </WholeWidthRow>
            )}

            {!isLoading && records.length === 0 && (
              <WholeWidthRow columnCount={columnCount}>
                <span className="inline-flex flex-col items-center gap-2">
                  <Inbox className="h-6 w-6 text-slate-400" />
                  No records found.
                </span>
              </WholeWidthRow>
            )}

            {!isLoading &&
              records.map(record => (
                <tr key={record.id} className="hover:bg-slate-50">
                  {columnNames.map(columnName => (
                    <td key={columnName} className="max-w-xs px-4 py-3 align-top">
                      {textForCell(columnName, record[columnName])}
                    </td>
                  ))}

                  {canEditAndDelete && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => onEdit(record)}
                        className="mr-3 inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(record.id)}
                        className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Notice({ children }) {
  return (
    <p className="mb-4 flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
      <Eye className="h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

export default function ListPage({ listName }) {
  const page = PAGE_SETTINGS[listName];
  const user = getLoggedInUser();
  const role = user?.role;

  const canAdd = page.rolesThatCanAdd.includes(role);
  const canEditAndDelete = page.rolesThatCanEditAndDelete.includes(role);

  const columnNames = useMemo(() => page.tableColumns || page.formFields, [page]);

  const fieldsShownInForm = useMemo(() => {
    const filledByServer = page.fieldsTheServerFillsInForRole?.[role] || [];

    return page.formFields.filter(fieldName => !filledByServer.includes(fieldName));
  }, [page, role]);

  const fieldsPointingToAnotherList = useMemo(() => {
    const everyFieldOnThePage = [...new Set([...fieldsShownInForm, ...columnNames])];

    return everyFieldOnThePage.filter(fieldName => LINKED_LIST_FOR_EACH_FIELD[fieldName]);
  }, [fieldsShownInForm, columnNames]);

  const [records, setRecords] = useState([]);
  const [choicesForEachField, setChoicesForEachField] = useState({});
  const [form, setForm] = useState(() => emptyForm(fieldsShownInForm));
  const [recordBeingEdited, setRecordBeingEdited] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let pageWasClosed = false;

    async function loadEverything() {
      const [listAnswer, choices] = await Promise.all([
        waitWithoutThrowing(getList(listName)),
        loadChoicesForFields(fieldsPointingToAnotherList),
      ]);

      if (pageWasClosed) {
        return;
      }

      setChoicesForEachField(choices);

      if (listAnswer.worked) {
        setRecords(recordsFrom(listAnswer.value));
      } else {
        setErrorMessage(listAnswer.failure.message);
      }

      setIsLoading(false);
    }

    loadEverything();

    return () => {
      pageWasClosed = true;
    };
  }, [listName, fieldsPointingToAnotherList]);

  async function reloadRecords(alsoReloadChoices = false) {
    setIsLoading(true);
    setErrorMessage("");

    const [listAnswer, choices] = await Promise.all([
      waitWithoutThrowing(getList(listName)),
      alsoReloadChoices ? loadChoicesForFields(fieldsPointingToAnotherList) : null,
    ]);

    if (choices) {
      setChoicesForEachField(choices);
    }

    if (listAnswer.worked) {
      setRecords(recordsFrom(listAnswer.value));
    } else {
      setErrorMessage(listAnswer.failure.message);
    }

    setIsLoading(false);
  }

  function changeOneBox(fieldName, newValue) {
    setForm(oldForm => ({ ...oldForm, [fieldName]: newValue }));
  }

  function emptyTheForm() {
    setRecordBeingEdited(null);
    setForm(emptyForm(fieldsShownInForm));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    const recordToSend = {};

    fieldsShownInForm.forEach(fieldName => {
      const value = form[fieldName];
      recordToSend[fieldName] = fieldName === "due_date" ? toServerDateTime(value) : value;
    });

    try {
      if (recordBeingEdited) {
        await updateInList(listName, recordBeingEdited.id, recordToSend);
      } else {
        await addToList(listName, recordToSend);
      }

      emptyTheForm();
      await reloadRecords(true);
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(recordId) {
    const personSaidYes = window.confirm("Delete this record?");

    if (!personSaidYes) {
      return;
    }

    setErrorMessage("");

    try {
      await deleteFromList(listName, recordId);
      await reloadRecords();
    } catch (failure) {
      setErrorMessage(failure.message);
    }
  }

  function handleEdit(record) {
    setRecordBeingEdited(record);

    const formValues = {};

    fieldsShownInForm.forEach(fieldName => {
      if (fieldName === "due_date") {
        formValues[fieldName] = toDateTimeBoxValue(record[fieldName]);
      } else {
        formValues[fieldName] = record[fieldName] ?? "";
      }
    });

    setForm(formValues);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function textForCell(fieldName, value) {
    if (LINKED_LIST_FOR_EACH_FIELD[fieldName]) {
      const choiceRecords = choicesForEachField[fieldName]?.records || [];
      const matching = choiceRecords.find(choice => String(choice.id) === String(value));

      if (matching) {
        return LINKED_LIST_FOR_EACH_FIELD[fieldName].describe(matching);
      }

      if (value === null || value === undefined || value === "") {
        return "";
      }

      return `#${value}`;
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (DATE_AND_TIME_FIELDS.includes(fieldName)) {
      return value ? new Date(value).toLocaleString() : "";
    }

    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    return String(value ?? "");
  }

  return (
    <Layout title={page.title}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">LMS management</p>
          <h2 className="text-2xl font-bold">{page.title}</h2>
        </div>

        <button
          onClick={() => reloadRecords(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {!canAdd && !canEditAndDelete && (
        <Notice>You can read this list. Changing it is not something your role allows.</Notice>
      )}

      {listName === "submissions" && role === "student" && (
        <Notice>
          This is your own work only. Handing in files it under your account; after that only a
          teacher can change it.
        </Notice>
      )}

      {canAdd && (
        <RecordForm
          oneRecordIsCalled={page.oneRecordIsCalled}
          fieldNames={fieldsShownInForm}
          form={form}
          choicesForEachField={choicesForEachField}
          isEditing={Boolean(recordBeingEdited)}
          isSaving={isSaving}
          onChangeOneBox={changeOneBox}
          onCancelEditing={emptyTheForm}
          onSubmit={handleSubmit}
        />
      )}

      <ErrorMessage className="mb-4">{errorMessage}</ErrorMessage>

      <RecordsTable
        columnNames={columnNames}
        records={records}
        isLoading={isLoading}
        canEditAndDelete={canEditAndDelete}
        textForCell={textForCell}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
