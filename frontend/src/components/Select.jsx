import { useId } from "react";
import { nameFromLabel } from "./field.js";
import { inputBox, labelText } from "./styles.js";

export default function Select({
  label,
  placeholder,
  className = "",
  children,
  ...rest
}) {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className={labelText}>
        {label}
      </label>

      <select
        className={inputBox}
        id={id}
        name={nameFromLabel(label)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </div>
  );
}
