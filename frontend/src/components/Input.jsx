import { inputBox, labelText } from "./styles.js";

export default function Input({ label, className = "", ...rest }) {
  return (
    <label className={className}>
      <span className={labelText}>{label}</span>
      <input className={inputBox} {...rest} />
    </label>
  );
}
