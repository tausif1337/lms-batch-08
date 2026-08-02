// The two long Tailwind strings that every form box shares.
//
// They used to be copied at the top of every page. Now they live here once,
// and the small components next to this file are the only things that read
// them. Change a colour here and every box on every page changes with it.

export const inputBox =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";

export const labelText = "mb-1 block text-sm font-medium text-slate-700";
