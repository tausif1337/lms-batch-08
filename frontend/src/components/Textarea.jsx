// A taller box for longer text, with its words above it.
//
// rows={3} means it is three lines tall to begin with. That is the starting
// number here, and a page can ask for more with <Textarea rows={5} ... />.

import { inputBox, labelText } from "./styles.js";

export default function Textarea({ label, rows = 3, className = "", ...rest }) {
  return (
    <label className={"block " + className}>
      <span className={labelText}>{label}</span>
      <textarea rows={rows} className={inputBox} {...rest} />
    </label>
  );
}
