export default function Select({
  label,
  placeholder,
  className = "",
  children,
  ...rest
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </label>
  );
}
