import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  Inbox,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import { ErrorMessage, InfoMessage } from "../components/Message.jsx";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CheckboxField,
  ConfirmDialog,
  EmptyState,
  Field,
  PageHeader,
  SelectInput,
  Skeleton,
  TextArea,
  TextInput,
} from "../components/ui/index.js";
import { addToList, deleteFromList, getList, updateInList } from "../api.js";
import { getLoggedInUser } from "../auth.js";
import { recordsFrom } from "../lib/records.js";
import { cn } from "../lib/cn.js";

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
    columnsHiddenForRole: { student: ["student"] },
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

/** "a lesson" but "an assignment" — every record name here starts with a
 *  letter, so first-letter vowel matching is enough. */
function articleFor(word) {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function emptyForm(fieldNames) {
  const startingValues = {};

  fieldNames.forEach(fieldName => {
    startingValues[fieldName] = fieldName === "is_active" ? true : "";
  });

  return startingValues;
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

/** One labelled control, picked from the field name. */
function FormField({ fieldName, value, choices, onChange }) {
  const label = titleFor(fieldName);

  if (fieldName === "is_active") {
    return (
      <CheckboxField
        label={label}
        hint="Account is active"
        checked={Boolean(value)}
        onChange={event => onChange(event.target.checked)}
      />
    );
  }

  if (LINKED_LIST_FOR_EACH_FIELD[fieldName]) {
    const records = choices?.records || [];
    const thingName = label.toLowerCase();

    let firstOptionText = `Select ${thingName}`;

    if (!choices) {
      firstOptionText = "Loading...";
    } else if (choices.couldNotLoad) {
      firstOptionText = `Could not load ${thingName}s`;
    } else if (records.length === 0) {
      firstOptionText = `No ${thingName}s yet — add one first`;
    }

    return (
      <Field label={label} required>
        {fieldProps => (
          <SelectInput
            {...fieldProps}
            required
            disabled={records.length === 0}
            value={value ?? ""}
            onChange={event => onChange(event.target.value)}
          >
            <option value="">{firstOptionText}</option>
            {records.map(record => (
              <option key={record.id} value={record.id}>
                {LINKED_LIST_FOR_EACH_FIELD[fieldName].describe(record)}
              </option>
            ))}
          </SelectInput>
        )}
      </Field>
    );
  }

  if (LONG_TEXT_FIELDS.includes(fieldName)) {
    return (
      <Field label={label} required className="sm:col-span-2 lg:col-span-3">
        {fieldProps => (
          <TextArea
            {...fieldProps}
            required
            rows="3"
            value={value}
            onChange={event => onChange(event.target.value)}
          />
        )}
      </Field>
    );
  }

  const extraProps = {};

  if (fieldName === "score") {
    Object.assign(extraProps, { type: "number", step: "any", min: "0" });
  } else if (fieldName === "due_date") {
    extraProps.type = "datetime-local";
  } else if (fieldName.includes("date")) {
    extraProps.type = "date";
  } else if (fieldName === "email") {
    extraProps.type = "email";
  } else {
    extraProps.type = "text";
  }

  const isRequired = fieldName !== "roll_number";

  return (
    <Field label={label} required={isRequired}>
      {fieldProps => (
        <TextInput
          {...fieldProps}
          {...extraProps}
          required={isRequired}
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      )}
    </Field>
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
  onClose,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <Card>
        <CardHeader
          Icon={isEditing ? Pencil : Plus}
          title={isEditing ? `Edit ${oneRecordIsCalled}` : `New ${oneRecordIsCalled}`}
          description={
            isEditing
              ? "Change the fields you need, then save."
              : `Fill in the details to add ${articleFor(oneRecordIsCalled)} ${oneRecordIsCalled.toLowerCase()}.`
          }
          action={
            <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          }
        />

        <CardBody>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fieldNames.map(fieldName => (
              <FormField
                key={fieldName}
                fieldName={fieldName}
                value={form[fieldName]}
                choices={choicesForEachField[fieldName]}
                onChange={newValue => onChangeOneBox(fieldName, newValue)}
              />
            ))}
          </div>
        </CardBody>

        <CardFooter className="justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            Icon={isEditing ? Save : Plus}
            isLoading={isSaving}
            loadingLabel="Saving..."
          >
            {isEditing ? "Save changes" : `Create ${oneRecordIsCalled.toLowerCase()}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function BooleanCell({ value }) {
  return (
    <Badge tone={value ? "success" : "neutral"}>
      {value ? (
        <Check aria-hidden="true" className="h-3 w-3" />
      ) : (
        <Minus aria-hidden="true" className="h-3 w-3" />
      )}
      {value ? "Yes" : "No"}
    </Badge>
  );
}

function RowActions({ record, onEdit, onDelete, className = "" }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        Icon={Pencil}
        onClick={() => onEdit(record)}
        className="text-content-muted hover:text-primary"
      >
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        Icon={Trash2}
        onClick={() => onDelete(record)}
        className="text-content-muted hover:bg-danger-soft hover:text-danger"
      >
        Delete
      </Button>
    </div>
  );
}

function LoadingRows({ columnCount }) {
  return Array.from({ length: 4 }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      {Array.from({ length: columnCount }).map((__, cellIndex) => (
        <td key={cellIndex} className="px-4 py-3.5">
          <Skeleton className="h-4 w-24" />
        </td>
      ))}
    </tr>
  ));
}

/** Desktop table. Below `sm` the card list below is shown instead, so nothing
 *  has to be scrolled sideways on a phone. */
function RecordsTable({ columnNames, records, canEditAndDelete, renderCell, onEdit, onDelete }) {
  return (
    <div className="hidden overflow-x-auto sm:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-muted">
            {columnNames.map(columnName => (
              <th
                key={columnName}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-content-subtle"
              >
                {titleFor(columnName)}
              </th>
            ))}
            {canEditAndDelete && (
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-line">
          {records.map(record => (
            <tr key={record.id} className="transition-colors hover:bg-surface-muted/60">
              {columnNames.map(columnName => (
                <td
                  key={columnName}
                  className="max-w-[22rem] px-4 py-3.5 align-top text-content-muted"
                >
                  {renderCell(columnName, record[columnName], record)}
                </td>
              ))}

              {canEditAndDelete && (
                <td className="whitespace-nowrap px-2 py-2 text-right align-top">
                  <RowActions
                    record={record}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    className="justify-end"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Columns worth using as a card headline, best first. Falling back to
 *  columnNames[0] would title the Students cards with "account", which is
 *  blank for any student not linked to a login. */
const HEADLINE_COLUMNS = ["name", "title"];

function headlineColumnOf(columnNames) {
  return HEADLINE_COLUMNS.find(column => columnNames.includes(column)) || columnNames[0];
}

function RecordCards({ columnNames, records, canEditAndDelete, renderCell, onEdit, onDelete }) {
  const headlineColumn = headlineColumnOf(columnNames);
  const otherColumns = columnNames.filter(column => column !== headlineColumn);

  return (
    <ul className="divide-y divide-line sm:hidden">
      {records.map(record => (
        <li key={record.id} className="p-4">
          <p className="font-semibold text-content">
            {renderCell(headlineColumn, record[headlineColumn], record)}
          </p>

          <dl className="mt-3 space-y-1.5">
            {otherColumns.map(columnName => (
              <div key={columnName} className="flex gap-3 text-sm">
                <dt className="w-28 shrink-0 text-content-subtle">{titleFor(columnName)}</dt>
                <dd className="min-w-0 flex-1 break-words text-content-muted">
                  {renderCell(columnName, record[columnName], record)}
                </dd>
              </div>
            ))}
          </dl>

          {canEditAndDelete && (
            <RowActions
              record={record}
              onEdit={onEdit}
              onDelete={onDelete}
              className="mt-3 -ml-2"
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ListPage({ listName }) {
  const page = PAGE_SETTINGS[listName];
  const user = getLoggedInUser();
  const role = user?.role;

  const canAdd = page.rolesThatCanAdd.includes(role);
  const canEditAndDelete = page.rolesThatCanEditAndDelete.includes(role);

  const columnNames = useMemo(() => {
    const everyColumn = page.tableColumns || page.formFields;
    const hiddenForThisRole = page.columnsHiddenForRole?.[role] || [];

    return everyColumn.filter(columnName => !hiddenForThisRole.includes(columnName));
  }, [page, role]);

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [searchText, setSearchText] = useState("");
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

  function closeAndEmptyTheForm() {
    setRecordBeingEdited(null);
    setIsFormOpen(false);
    setForm(emptyForm(fieldsShownInForm));
  }

  function openBlankForm() {
    setRecordBeingEdited(null);
    setForm(emptyForm(fieldsShownInForm));
    setIsFormOpen(true);
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

      closeAndEmptyTheForm();
      await reloadRecords(true);
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await deleteFromList(listName, recordToDelete.id);
      setRecordToDelete(null);
      await reloadRecords();
    } catch (failure) {
      setErrorMessage(failure.message);
      setRecordToDelete(null);
    } finally {
      setIsDeleting(false);
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
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const textForCell = useCallback(
    (fieldName, value, record) => {
      if (LINKED_LIST_FOR_EACH_FIELD[fieldName]) {
        const choiceRecords = choicesForEachField[fieldName]?.records || [];
        const matching = choiceRecords.find(choice => String(choice.id) === String(value));

        if (matching) {
          return LINKED_LIST_FOR_EACH_FIELD[fieldName].describe(matching);
        }

        if (value === null || value === undefined || value === "") {
          return "";
        }

        // Some lists are staff-only, so a student cannot fetch the names to
        // look this id up in. The server sends the name on the row itself for
        // exactly that case; a bare id is the last resort.
        const nameSentWithTheRecord = record?.[`${fieldName}_name`];

        return nameSentWithTheRecord || `#${value}`;
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
    },
    [choicesForEachField],
  );

  /** Same value as textForCell, but booleans come back as a badge. Search runs
   *  on textForCell so it still matches "yes"/"no". */
  function renderCell(fieldName, value, record) {
    if (typeof value === "boolean") {
      return <BooleanCell value={value} />;
    }

    const text = textForCell(fieldName, value, record);

    return text === "" ? <span className="text-content-subtle">—</span> : text;
  }

  const matchingRecords = useMemo(() => {
    const needle = searchText.trim().toLowerCase();

    if (!needle) {
      return records;
    }

    return records.filter(record =>
      columnNames.some(columnName =>
        textForCell(columnName, record[columnName], record).toLowerCase().includes(needle),
      ),
    );
  }, [records, columnNames, searchText, textForCell]);

  const columnCount = columnNames.length + (canEditAndDelete ? 1 : 0);
  const isSearching = searchText.trim().length > 0;

  return (
    <Layout title={page.title}>
      <PageHeader
        eyebrow="LMS management"
        title={page.title}
        description={
          isLoading
            ? "Loading records..."
            : `${records.length} ${records.length === 1 ? "record" : "records"}${
                isSearching ? ` · ${matchingRecords.length} matching` : ""
              }`
        }
        action={
          <>
            <Button
              variant="secondary"
              onClick={() => reloadRecords(true)}
              disabled={isLoading}
              aria-label="Refresh list"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              Refresh
            </Button>

            {canAdd && !isFormOpen && (
              <Button Icon={Plus} onClick={openBlankForm}>
                New {page.oneRecordIsCalled.toLowerCase()}
              </Button>
            )}
          </>
        }
      />

      {!canAdd && !canEditAndDelete && (
        <InfoMessage className="mb-4">
          You can read this list. Changing it is not something your role allows.
        </InfoMessage>
      )}

      {listName === "submissions" && role === "student" && (
        <InfoMessage className="mb-4">
          You only see your own work here. Anything you hand in is filed under your account, and
          after that only a teacher can change it.
        </InfoMessage>
      )}

      {canAdd && isFormOpen && (
        <RecordForm
          oneRecordIsCalled={page.oneRecordIsCalled}
          fieldNames={fieldsShownInForm}
          form={form}
          choicesForEachField={choicesForEachField}
          isEditing={Boolean(recordBeingEdited)}
          isSaving={isSaving}
          onChangeOneBox={changeOneBox}
          onClose={closeAndEmptyTheForm}
          onSubmit={handleSubmit}
        />
      )}

      <ErrorMessage className="mb-4" onDismiss={() => setErrorMessage("")}>
        {errorMessage}
      </ErrorMessage>

      <Card className="overflow-hidden">
        <div className="border-b border-line p-3">
          <div className="relative max-w-xs">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle"
            />
            <input
              type="search"
              value={searchText}
              onChange={event => setSearchText(event.target.value)}
              placeholder={`Search ${page.title.toLowerCase()}...`}
              aria-label={`Search ${page.title.toLowerCase()}`}
              className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-content placeholder:text-content-subtle transition hover:border-line-strong focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
          </div>
        </div>

        {isLoading && (
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-line">
              <LoadingRows columnCount={columnCount} />
            </tbody>
          </table>
        )}

        {!isLoading && matchingRecords.length === 0 && (
          <EmptyState
            Icon={isSearching ? SearchX : Inbox}
            title={isSearching ? "No matches" : `No ${page.title.toLowerCase()} yet`}
            description={
              isSearching
                ? `Nothing here matches "${searchText.trim()}".`
                : canAdd
                  ? `Records you add will show up here.`
                  : "Nothing has been added to this list yet."
            }
            action={
              isSearching ? (
                <Button variant="secondary" Icon={X} onClick={() => setSearchText("")}>
                  Clear search
                </Button>
              ) : canAdd && !isFormOpen ? (
                <Button Icon={Plus} onClick={openBlankForm}>
                  New {page.oneRecordIsCalled.toLowerCase()}
                </Button>
              ) : null
            }
          />
        )}

        {!isLoading && matchingRecords.length > 0 && (
          <>
            <RecordsTable
              columnNames={columnNames}
              records={matchingRecords}
              canEditAndDelete={canEditAndDelete}
              renderCell={renderCell}
              onEdit={handleEdit}
              onDelete={setRecordToDelete}
            />
            <RecordCards
              columnNames={columnNames}
              records={matchingRecords}
              canEditAndDelete={canEditAndDelete}
              renderCell={renderCell}
              onEdit={handleEdit}
              onDelete={setRecordToDelete}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        title={`Delete this ${page.oneRecordIsCalled.toLowerCase()}?`}
        description="This cannot be undone. Records that depend on it will block the delete."
        confirmLabel="Delete"
        isWorking={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />
    </Layout>
  );
}
