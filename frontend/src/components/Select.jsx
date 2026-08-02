import { inputBox, labelText } from "./styles.js";

export default function Select({
  label,
  placeholder,
  className = "",
  children,
  ...rest
}) {
  return (
    <label className={className}>
      <span className={labelText}>{label}</span>
      <select className={inputBox} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </label>
  );
}
