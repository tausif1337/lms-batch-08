import { inputBox, labelText } from "./styles.js";

export default function Textarea({ label, rows = 3, className = "", ...rest }) {
  return (
    <label className={"block " + className}>
      <span className={labelText}>{label}</span>
      <textarea rows={rows} className={inputBox} {...rest} />
    </label>
  );
}