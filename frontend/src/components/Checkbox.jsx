// A tickbox with its words beside it.
//
// A tickbox uses `checked` instead of `value`, and reads
// event.target.checked instead of event.target.value:
//
//   <Checkbox
//     label="Active"
//     checked={isActive}
//     onChange={(event) => setIsActive(event.target.checked)}
//   />

export default function Checkbox({ label, className = "", ...rest }) {
  return (
    <label
      className={
        "flex items-center gap-2 text-sm text-slate-700 " + className
      }
    >
      <input type="checkbox" className="h-4 w-4" {...rest} />
      {label}
    </label>
  );
}
