// The big title and the grey line under it, at the top of every page.
//
//   <PageHeader title="Teachers" subtitle="The people who teach courses." />
//
// The <> and </> around the two lines is a fragment: it lets a component
// return two things side by side without wrapping them in an extra <div>.

export default function PageHeader({ title, subtitle }) {
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">{subtitle}</p>
    </>
  );
}
