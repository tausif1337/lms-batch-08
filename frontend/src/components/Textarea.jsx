import { useId } from "react";
import { nameFromLabel } from "./field.js";
import { inputBox, labelText } from "./styles.js";

export default function Textarea({ label, rows = 3, className = "", ...rest }) {
  const id = useId();

  return (
    <div className={"block " + className}>
      <label htmlFor={id} className={labelText}>
        {label}
      </label>

      <textarea
        rows={rows}
        className={inputBox}
        id={id}
        name={nameFromLabel(label)}
        {...rest}
      />
    </div>
  );
}
