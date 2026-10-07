import { NavLink } from 'react-router-dom';
export function Card({
  title,
  value,
  detail
}) {
  return <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 h-1 w-9 rounded-full bg-blue-600 transition-all group-hover:w-14" />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>;
}
export function Badge({
  children
}) {
  const value = String(children).toLowerCase();
  const tone = ['present', 'completed'].includes(value) ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' : value === 'absent' ? 'bg-rose-50 text-rose-700 ring-rose-600/15' : 'bg-amber-50 text-amber-700 ring-amber-600/15';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${tone}`}>{children}</span>;
}
export function Loading() {
  return <div className="flex items-center justify-center gap-3 py-16 text-sm font-medium text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />Loading...</div>;
}
export function Empty({
  children = 'No records found.'
}) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-12 text-center text-sm text-slate-500">{children}</div>;
}
export function Button({
  children,
  ...props
}) {
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}>{children}</button>;
}
export function Table({
  headers,
  children
}) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50/90 text-[11px] uppercase tracking-[0.12em] text-slate-500"><tr>{headers.map(header => <th className="px-4 py-3.5 font-semibold" key={header}>{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{children}</tbody></table></div>;
}
export function Cell({
  children
}) {
  return <td className="px-4 py-3.5 align-middle text-slate-700">{children}</td>;
}
export function ProgressBar({
  value = 0
}) {
  return <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500" style={{
      width: `${Math.min(100, Math.max(0, value))}%`
    }} /></div>;
}
const adminLinks = [['/admin/dashboard', 'Overview'], ['/admin/students', 'Students'], ['/admin/labs', 'Lab sessions'], ['/admin/attendance', 'Attendance'], ['/admin/practicals', 'Practicals'], ['/admin/analytics', 'Analytics'], ['/profile', 'Profile']];
const studentLinks = [['/student/dashboard', 'Overview'], ['/student/labs', 'My lab sessions'], ['/student/attendance', 'Attendance'], ['/student/practicals', 'Practicals'], ['/student/analytics', 'Analytics'], ['/profile', 'Profile']];
export function Layout({
  user,
  onLogout,
  children
}) {
  const links = user.role === 'admin' ? adminLinks : studentLinks;
  const initials = user.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b border-slate-800 bg-slate-950 text-white md:fixed md:inset-y-0 md:z-20 md:flex md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-5 py-5 md:px-6 md:py-7">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black tracking-wide shadow-lg shadow-blue-950/40">LT</div>
          <div><p className="font-bold tracking-tight">IIPS LabTrack</p><p className="mt-0.5 text-[11px] text-slate-400">Lab tracking & analytics</p></div>
        </div>
        <div className="hidden px-6 pb-4 md:block">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace</p>
            <p className="mt-1.5 text-sm font-medium">{user.role === 'admin' ? 'Semester 9 · OOAD & MM' : `${user.branch || 'Student'} · Semester ${user.semester || '—'}`}</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-y-auto md:px-4 md:pb-4">
          <p className="hidden px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:block">Workspace</p>
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to.endsWith('/dashboard')} className={({
          isActive
        }) => `whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-950/30' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}>{label}</NavLink>)}
          <button onClick={onLogout} className="whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white md:mt-auto">Sign out</button>
        </nav>
        <div className="hidden border-t border-slate-800 px-6 py-4 text-xs text-slate-500 md:block">International Institute of Professional Studies</div>
      </aside>
      <main className="min-w-0 flex-1 md:ml-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 py-3.5 backdrop-blur md:px-8">
          <div><p className="text-xs text-slate-500">IIPS LabTrack</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{user.role === 'admin' ? 'Faculty workspace' : 'Student workspace'}</p></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{user.name}</p><p className="text-xs capitalize text-slate-500">{user.role}</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">{initials}</div></div>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>;
}
