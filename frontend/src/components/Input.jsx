// One box you type in, with its words above it.
//
// The whole thing is a <label> wrapped around an <input>, so clicking the
// words puts the cursor in the box.
//
// Use it like this:
//   <Input label="Name" value={name} onChange={...} />
//   <Input label="Email" type="email" value={email} onChange={...} />
//
// `label` is the words above the box. `className` is put on the <label>, so
// it moves the whole thing. Everything else — value, onChange, type,
// placeholder, step — goes to the <input> itself.

import { inputBox, labelText } from "./styles.js";

export default function Input({ label, className = "", ...rest }) {
  return (
    <label className={className}>
      <span className={labelText}>{label}</span>
      <input className={inputBox} {...rest} />
    </label>
  );
}
