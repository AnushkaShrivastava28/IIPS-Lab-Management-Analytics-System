import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { messageFrom } from '../services/api';
import { Card, Loading, Empty, Button, Table, Cell, Badge, ProgressBar } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell as ChartCell, Legend } from 'recharts';
function useLoad(url) {
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    api.get(url).then(r => setData(r.data.data)).catch(e => setError(messageFrom(e)));
  }, [url]);
  return {
    data,
    error,
    setData
  };
}
function PageTitle({
  title,
  subtitle,
  action
}) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-700">IIPS LabTrack</p><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}</div>{action}</div>;
}
export function Dashboard() {
  const {
    user
  } = useAuth();
  return user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
}
function AdminDashboard() {
  const {
    data,
    error
  } = useLoad('/analytics/overview');
  if (!data && !error) return <Loading />;
  if (error) return <p className="text-red-600">{error}</p>;
  const att = [{
      name: 'Attendance',
      Present: data.attendance.present,
      Absent: data.attendance.absent
    }],
    pr = [{
      name: 'Practicals',
      Completed: data.practicalsByStatus.completed,
      'In Progress': data.practicalsByStatus.inProgress,
      Pending: data.practicalsByStatus.pending
    }];
  return <><PageTitle title="Semester 9 overview" subtitle="OOAD and MM lab attendance and practical progress" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Total Students" value={data.totalStudents} /><Card title="Lab Sessions" value={data.totalLabSessions} /><Card title="Average Attendance" value={`${data.averageAttendance}%`} /><Card title="Practical Completion" value={`${data.practicalCompletion}%`} /></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-xl border bg-white p-5"><h2 className="mb-4 font-semibold">Attendance overview</h2><div className="h-64"><ResponsiveContainer><BarChart data={att}><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="Present" fill="#2563eb" /><Bar dataKey="Absent" fill="#f59e0b" /></BarChart></ResponsiveContainer></div></section><section className="rounded-xl border bg-white p-5"><h2 className="mb-4 font-semibold">Practical completion</h2><div className="h-64"><ResponsiveContainer><PieChart><Pie data={Object.entries(data.practicalsByStatus).map(([name, value]) => ({
                name,
                value
              }))} dataKey="value" nameKey="name" outerRadius={85} label>{['#16a34a', '#f59e0b', '#3b82f6'].map((c, i) => <ChartCell key={i} fill={c} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></section></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><section><h2 className="mb-3 font-semibold">Recent students</h2><Table headers={['Student', 'ID', 'Branch', 'Semester']}>{data.recentStudents.map(s => <tr key={s._id}><Cell>{s.name}</Cell><Cell>{s.studentId}</Cell><Cell>{s.branch}</Cell><Cell>{s.semester}</Cell></tr>)}</Table></section><section><h2 className="mb-3 font-semibold">Recent lab sessions</h2><Table headers={['Lab', 'Date', 'Room']}>{data.recentLabs.map(l => <tr key={l._id}><Cell>{l.labName}</Cell><Cell>{l.date}</Cell><Cell>{l.room}</Cell></tr>)}</Table></section></div></>;
}
function StudentDashboard() {
  const {
    user
  } = useAuth();
  const {
    data: stats,
    error: statsError
  } = useLoad(`/analytics/student/${user.id}`);
  const {
    data: labs,
    error: labsError
  } = useLoad('/labs');
  const {
    data: progress,
    error: progressError
  } = useLoad(`/progress/student/${user.id}`);
  if (statsError) return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Could not load your analytics: {statsError}</p>;
  if (!stats) return <Loading />;
  const sorted = [...(labs || [])].sort((a, b) => a.date.localeCompare(b.date));
  return <>
    <PageTitle title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Your lab activity and practical progress" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Attendance" value={`${stats.attendancePercentage}%`} /><Card title="Practical completion" value={`${stats.practicalCompletionPercentage}%`} /><Card title="Lab sessions" value={stats.totalLabSessions} /><Card title="Pending practicals" value={stats.pendingPracticals} /></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Your progress</h2><p className="mb-3 mt-1 text-sm text-slate-500">Overall progress: {stats.overallProgress}%</p><ProgressBar value={stats.attendancePercentage} /><p className="mb-2 mt-2 text-xs text-slate-500">Attendance · {stats.presentSessions} of {stats.totalLabSessions} attended</p><ProgressBar value={stats.practicalCompletionPercentage} /><p className="mt-2 text-xs text-slate-500">Practicals · {stats.completedPracticals} of {stats.totalPracticals} completed</p></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold text-slate-900">Recent practicals</h2><span className="text-xs text-slate-500">{stats.totalPracticals} assigned</span></div>{progressError ? <p className="py-5 text-sm text-rose-700">{progressError}</p> : progress?.length ? progress.slice(0, 4).map(item => <div key={item._id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"><div><p className="text-sm font-medium text-slate-800">{item.practical?.title || 'Practical'}</p><p className="mt-0.5 text-xs text-slate-500">Due {item.practical?.deadline || '—'}</p></div><Badge>{item.status}</Badge></div>) : <Empty>No practicals assigned.</Empty>}</section>
    </div>
    <section className="mt-6"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-900">Upcoming lab sessions</h2><span className="text-xs text-slate-500">Semester 9 · MCA</span></div>{labsError ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{labsError}</p> : sorted.length ? <Table headers={['Lab', 'Subject', 'Date', 'Time', 'Room']}>{sorted.slice(0, 5).map(lab => <tr key={lab._id}><Cell>{lab.labName}</Cell><Cell><Badge>{lab.subject}</Badge></Cell><Cell>{lab.date}</Cell><Cell>{lab.startTime} – {lab.endTime}</Cell><Cell>{lab.room}</Cell></tr>)}</Table> : <Empty>No lab sessions found.</Empty>}</section>
  </>;
}
export function StudentsPage() {
  const {
    data,
    error,
    setData
  } = useLoad('/students');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'student123',
    studentId: ''
  });
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await api.post('/students', {
        ...form,
        semester: '9',
        branch: 'MCA'
      });
      setData(current => [response.data.data, ...(current || [])]);
      setMessage('Student added to semester 9.');
      setForm({
        name: '',
        email: '',
        password: 'student123',
        studentId: ''
      });
    } catch (requestError) {
      setMessage(messageFrom(requestError));
    } finally {
      setSaving(false);
    }
  }
  const filtered = (data || []).filter(student => `${student.name} ${student.email} ${student.studentId}`.toLowerCase().includes(search.toLowerCase()));
  if (!data && !error) return <Loading />;
  return <>
    <PageTitle title="Students" subtitle="Manage semester 9 MCA student accounts" />
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Add a student</h2><p className="mt-1 text-sm text-slate-500">New accounts are assigned to semester 9 · MCA.</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Semester 9 · MCA</span></div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-slate-600">Name<input required value={form.name} onChange={event => setForm({
            ...form,
            name: event.target.value
          })} placeholder="Student name" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Email<input required type="email" value={form.email} onChange={event => setForm({
            ...form,
            email: event.target.value
          })} placeholder="student@iips.edu" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Student ID<input required value={form.studentId} onChange={event => setForm({
            ...form,
            studentId: event.target.value
          })} placeholder="IIPS2025" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Initial password<input required minLength="6" type="password" value={form.password} onChange={event => setForm({
            ...form,
            password: event.target.value
          })} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <div className="flex items-end"><Button className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Add student'}</Button></div>
      </form>
      {message && <p role="status" className="mt-3 text-sm text-blue-700">{message}</p>}
    </section>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">Student list <span className="ml-1 text-sm font-normal text-slate-500">({filtered.length})</span></h2><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, email, or ID" className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm" /></div>
    {error ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : filtered.length ? <Table headers={['Name', 'Student ID', 'Email', 'Semester', 'Branch']}>
      {filtered.map(student => <tr key={student._id}><Cell><span className="font-semibold text-slate-900">{student.name}</span></Cell><Cell>{student.studentId}</Cell><Cell>{student.email}</Cell><Cell>9</Cell><Cell>MCA</Cell></tr>)}
    </Table> : <Empty>{search ? 'No students match that search.' : 'No students found.'}</Empty>}
  </>;
}
export function LabsPage({
  admin = false
}) {
  const {
    data,
    error,
    setData
  } = useLoad('/labs');
  const [form, setForm] = useState({
    labName: '',
    subject: 'OOAD',
    faculty: '',
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    room: ''
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const payload = {
      ...form,
      labName: form.labName || `${form.subject} Lab`,
      semester: '9',
      branch: 'MCA'
    };
    try {
      const response = await api.post('/labs', payload);
      setData(current => [response.data.data, ...(current || [])]);
      setMessage('Lab session created.');
      setForm(current => ({
        ...current,
        labName: '',
        date: '',
        room: ''
      }));
    } catch (requestError) {
      setMessage(messageFrom(requestError));
    } finally {
      setSaving(false);
    }
  }
  return <>
    <PageTitle title={admin ? 'Lab sessions' : 'My lab sessions'} subtitle={admin ? 'Schedule OOAD and MM practical sessions for semester 9' : 'Sessions scheduled for your semester and branch'} />
    {admin && <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Schedule a lab</h2><p className="mt-1 text-sm text-slate-500">This workspace is limited to semester 9 OOAD and MM.</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Semester 9 · MCA</span></div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-slate-600">Subject<select required value={form.subject} onChange={event => setForm({
            ...form,
            subject: event.target.value,
            labName: `${event.target.value} Lab`
          })} className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="OOAD">OOAD</option><option value="MM">MM</option></select></label>
        <label className="text-xs font-semibold text-slate-600">Lab name<input required value={form.labName} onChange={event => setForm({
            ...form,
            labName: event.target.value
          })} placeholder="OOAD Lab" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Faculty<input required value={form.faculty} onChange={event => setForm({
            ...form,
            faculty: event.target.value
          })} placeholder="Faculty name" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Date<input required type="date" value={form.date} onChange={event => setForm({
            ...form,
            date: event.target.value
          })} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Start time<input required type="time" value={form.startTime} onChange={event => setForm({
            ...form,
            startTime: event.target.value
          })} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">End time<input required type="time" value={form.endTime} onChange={event => setForm({
            ...form,
            endTime: event.target.value
          })} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Room<input required value={form.room} onChange={event => setForm({
            ...form,
            room: event.target.value
          })} placeholder="Lab 3" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <div className="flex items-end"><Button className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Add lab session'}</Button></div>
      </form>
      {message && <p role="status" className="mt-3 text-sm text-blue-700">{message}</p>}
    </section>}
    {error ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : data?.length ? <Table headers={['Lab', 'Subject', 'Date', 'Time', 'Faculty', 'Room']}>
      {data.map(lab => <tr key={lab._id}><Cell><span className="font-semibold text-slate-900">{lab.labName}</span></Cell><Cell><Badge>{lab.subject}</Badge></Cell><Cell>{lab.date}</Cell><Cell>{lab.startTime} – {lab.endTime}</Cell><Cell>{lab.faculty}</Cell><Cell>{lab.room}</Cell></tr>)}
    </Table> : <Empty>No lab sessions found.</Empty>}
  </>;
}
export function AttendancePage({
  admin = false
}) {
  const {
    user
  } = useAuth();
  const {
    data: labs
  } = useLoad('/labs');
  const {
    data: students
  } = useLoad(admin ? '/students' : `/students/${user.id}`);
  const {
    data: mine,
    error
  } = useLoad(admin ? '/attendance/student/000000000000000000000000' : `/attendance/student/${user.id}`);
  const [records, setRecords] = useState([]);
  const [msg, setMsg] = useState('');
  const [labId, setLabId] = useState('');
  const [rosterLoading, setRosterLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    async function loadRoster() {
      if (!admin || !labId || !students) return;
      setRosterLoading(true);
      setMsg('');
      try {
        const {
          data
        } = await api.get(`/attendance/lab/${labId}`);
        if (!active) return;
        const savedByStudent = new Map(data.data.map(item => [item.student?._id, item.status]));
        setRecords(students.map(student => ({
          student: student._id,
          status: savedByStudent.get(student._id) || 'present',
          name: student.name,
          studentId: student.studentId
        })));
      } catch (error) {
        if (active) setMsg(messageFrom(error));
      } finally {
        if (active) setRosterLoading(false);
      }
    }
    loadRoster();
    return () => {
      active = false;
    };
  }, [admin, labId, students]);
  async function save() {
    setSaving(true);
    setMsg('');
    try {
      await api.post('/attendance', {
        lab: labId,
        records
      });
      setMsg('Attendance saved successfully.');
    } catch (error) {
      setMsg(messageFrom(error));
    } finally {
      setSaving(false);
    }
  }
  if (!admin) return <>
    <PageTitle title="My attendance" subtitle="Your lab attendance records" />
    {error ? <p className="text-red-600">{error}</p> : mine?.length ? <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card title="Lab sessions" value={mine.length} />
        <Card title="Present" value={mine.filter(item => item.status === 'present').length} />
        <Card title="Attendance" value={`${Math.round(mine.filter(item => item.status === 'present').length / mine.length * 100)}%`} />
      </div>
      <Table headers={['Lab', 'Subject', 'Date', 'Status']}>
        {mine.map(item => <tr key={item._id}><Cell>{item.lab?.labName}</Cell><Cell>{item.lab?.subject}</Cell><Cell>{item.date}</Cell><Cell><Badge>{item.status}</Badge></Cell></tr>)}
      </Table>
    </> : <Empty>No attendance records found.</Empty>}
  </>;
  return <>
    <PageTitle title="Mark attendance" subtitle="Choose a lab session and record student attendance" />
    <select value={labId} onChange={event => setLabId(event.target.value)} className="mb-4 rounded-lg border bg-white px-3 py-2">
      <option value="">Select a lab session</option>
      {labs?.map(lab => <option value={lab._id} key={lab._id}>{lab.labName} — {lab.date}</option>)}
    </select>
    {labId && (rosterLoading ? <Loading /> : records.length ? <>
      <Table headers={['Student ID', 'Student Name', 'Status']}>
        {records.map((record, index) => <tr key={record.student}>
          <Cell>{record.studentId}</Cell><Cell>{record.name}</Cell>
          <Cell><select className="rounded border p-1" value={record.status} onChange={event => setRecords(current => current.map((item, i) => i === index ? {
              ...item,
              status: event.target.value
            } : item))}>
            <option value="present">Present</option><option value="absent">Absent</option>
          </select></Cell>
        </tr>)}
      </Table>
      <div className="mt-4 flex items-center gap-3"><Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save attendance'}</Button><span className="text-sm text-blue-700">{msg}</span></div>
    </> : <Empty>No students found.</Empty>)}
  </>;
}
export function PracticalsPage({
  admin = false
}) {
  const {
    user
  } = useAuth();
  const {
    data,
    error,
    setData
  } = useLoad('/practicals');
  const {
    data: progress,
    setData: setProgress
  } = useLoad(`/progress/student/${user.id}`);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'OOAD',
    deadline: ''
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function create(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await api.post('/practicals', {
        ...form,
        semester: '9',
        branch: 'MCA'
      });
      setData(current => [response.data.data, ...(current || [])]);
      setMessage('Practical assigned to semester 9 students.');
      setForm({
        title: '',
        description: '',
        subject: 'OOAD',
        deadline: ''
      });
    } catch (requestError) {
      setMessage(messageFrom(requestError));
    } finally {
      setSaving(false);
    }
  }
  async function changeStatus(practicalId, status) {
    setMessage('');
    try {
      const response = await api.post('/progress', {
        student: user.id,
        practical: practicalId,
        status
      });
      setProgress(current => (current || []).map(item => item.practical?._id === practicalId ? {
        ...item,
        ...response.data.data,
        practical: item.practical
      } : item));
    } catch (requestError) {
      setMessage(messageFrom(requestError));
    }
  }
  return <>
    <PageTitle title="Practicals" subtitle={admin ? 'Assign OOAD and MM practical work for semester 9' : 'Track your assigned practical work'} />
    {admin && <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Create a practical</h2><p className="mt-1 text-sm text-slate-500">Assignments go to matching semester 9 MCA students.</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Semester 9 · MCA</span></div>
      <form onSubmit={create} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-slate-600">Subject<select value={form.subject} onChange={event => setForm({
            ...form,
            subject: event.target.value
          })} className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="OOAD">OOAD</option><option value="MM">MM</option></select></label>
        <label className="text-xs font-semibold text-slate-600">Title<input required value={form.title} onChange={event => setForm({
            ...form,
            title: event.target.value
          })} placeholder="Practical title" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Deadline<input required type="date" value={form.deadline} onChange={event => setForm({
            ...form,
            deadline: event.target.value
          })} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2 xl:col-span-1">Description<textarea value={form.description} onChange={event => setForm({
            ...form,
            description: event.target.value
          })} rows="1" placeholder="What should students complete?" className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <div className="flex items-end"><Button className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Create practical'}</Button></div>
      </form>
      {message && <p role="status" className="mt-3 text-sm text-blue-700">{message}</p>}
    </section>}
    {error ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : data?.length ? <Table headers={admin ? ['Practical', 'Subject', 'Deadline', 'Semester'] : ['Practical', 'Subject', 'Deadline', 'Status', 'Update status']}>
      {data.map(practical => {
        const mine = (progress || []).find(item => item.practical?._id === practical._id);
        return <tr key={practical._id}>
          <Cell><span className="font-semibold text-slate-900">{practical.title}</span>{practical.description && <span className="mt-1 block max-w-md text-xs text-slate-500">{practical.description}</span>}</Cell>
          <Cell><Badge>{practical.subject}</Badge></Cell><Cell>{practical.deadline}</Cell>
          {admin ? <Cell>9</Cell> : <><Cell><Badge>{mine?.status || 'pending'}</Badge></Cell><Cell><select className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm" value={mine?.status || 'pending'} onChange={event => changeStatus(practical._id, event.target.value)}><option value="pending">Pending</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></Cell></>}
        </tr>;
      })}
    </Table> : <Empty>No practicals assigned.</Empty>}
  </>;
}
export function AnalyticsPage({
  admin = false
}) {
  const {
    user
  } = useAuth();
  const url = admin ? '/analytics/overview' : `/analytics/student/${user.id}`;
  const {
    data,
    error
  } = useLoad(url);
  if (!data && !error) return <Loading />;
  if (error) return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Could not load analytics: {error}</p>;
  const attendance = admin ? data.averageAttendance : data.attendancePercentage;
  const practicalCompletion = admin ? data.practicalCompletion : data.practicalCompletionPercentage;
  const attendanceChart = [{
    name: 'Present',
    value: admin ? data.attendance.present : data.presentSessions
  }, {
    name: 'Absent',
    value: admin ? data.attendance.absent : data.absentSessions
  }];
  const practicalChart = admin ? [{
    name: 'Completed',
    value: data.practicalsByStatus.completed
  }, {
    name: 'In progress',
    value: data.practicalsByStatus.inProgress
  }, {
    name: 'Pending',
    value: data.practicalsByStatus.pending
  }] : [{
    name: 'Completed',
    value: data.completedPracticals
  }, {
    name: 'In progress',
    value: data.inProgressPracticals
  }, {
    name: 'Pending',
    value: data.pendingPracticals
  }];
  return <>
    <PageTitle title={admin ? 'Analytics' : 'My analytics'} subtitle={admin ? 'Semester 9 MCA performance' : 'Your attendance and practical progress'} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card title="Attendance" value={`${attendance}%`} detail={admin ? 'Across semester 9 MCA students' : `${data.presentSessions} present of ${data.totalLabSessions} sessions`} />
      <Card title="Lab sessions" value={data.totalLabSessions} />
      <Card title="Practical completion" value={`${practicalCompletion}%`} detail={admin ? `${data.totalPracticals} assignments` : `${data.completedPracticals} of ${data.totalPracticals} completed`} />
      <Card title="Overall progress" value={admin ? '—' : `${data.overallProgress}%`} />
    </div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Attendance breakdown</h2><p className="mt-1 text-sm text-slate-500">Present and absent lab sessions</p><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={attendanceChart} margin={{
              top: 8,
              right: 12,
              left: -18,
              bottom: 0
            }}><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" name="Sessions" radius={[8, 8, 0, 0]}>{attendanceChart.map((item, index) => <ChartCell key={item.name} fill={index === 0 ? '#2563eb' : '#f43f5e'} />)}</Bar></BarChart></ResponsiveContainer></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Practical status</h2><p className="mt-1 text-sm text-slate-500">Completion across your assignments</p><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={practicalChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} label>{['#16a34a', '#3b82f6', '#f59e0b'].map((color, index) => <ChartCell key={index} fill={color} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={32} /></PieChart></ResponsiveContainer></div></section>
    </div>
    {!admin && <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card title="Present sessions" value={data.presentSessions} /><Card title="Absent sessions" value={data.absentSessions} /><Card title="Pending practicals" value={data.pendingPracticals} /><Card title="In progress" value={data.inProgressPracticals} /></div>}
  </>;
}
export function ProfilePage() {
  const {
    user
  } = useAuth();
  return <>
    <PageTitle title="My profile" subtitle="Your account information" />
    <div className="max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-7 text-white"><p className="text-sm text-blue-100">IIPS LabTrack account</p><h2 className="mt-1 text-2xl font-bold">{user.name}</h2></div>
      <dl className="grid gap-x-8 gap-y-5 p-6 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Email</dt><dd className="mt-1 font-semibold text-slate-900">{user.email}</dd></div>
        <div><dt className="text-slate-500">Role</dt><dd className="mt-1 font-semibold capitalize text-slate-900">{user.role === 'admin' ? 'Faculty / Admin' : 'Student'}</dd></div>
        {user.studentId && <div><dt className="text-slate-500">Student ID</dt><dd className="mt-1 font-semibold text-slate-900">{user.studentId}</dd></div>}
        {user.semester && <div><dt className="text-slate-500">Semester</dt><dd className="mt-1 font-semibold text-slate-900">{user.semester}</dd></div>}
        {user.branch && <div><dt className="text-slate-500">Branch</dt><dd className="mt-1 font-semibold text-slate-900">{user.branch}</dd></div>}
        {user.role === 'admin' && <div><dt className="text-slate-500">Managed subjects</dt><dd className="mt-1 font-semibold text-slate-900">OOAD · MM</dd></div>}
      </dl>
    </div>
  </>;
}
