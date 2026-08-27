import { useId } from "react";
import { nameFromLabel } from "./field.js";

export default function Checkbox({ label, className = "", ...rest }) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={"flex items-center gap-2 text-sm text-slate-700 " + className}
    >
      <input
        type="checkbox"
        className="h-4 w-4"
        id={id}
        name={nameFromLabel(label)}
        {...rest}
      />
      {label}
    </label>
  );
}
