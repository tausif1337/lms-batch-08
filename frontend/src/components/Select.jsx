// A dropdown, with its words above it.
//
// `placeholder` is the first empty line in the list, so the box starts blank.
// The <option> lines themselves are written by the page and arrive here as
// `children`, because only the page knows which list to show.
//
//   <Select label="Teacher" placeholder="Choose a teacher..." value={id} onChange={...}>
//     {teachers.map((teacher) => (
//       <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
//     ))}
//   </Select>

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
