import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/UI';
import { messageFrom } from '../services/api';
export default function Login() {
  const {
    user,
    login
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const signedInUser = await login({
        email,
        password
      });
      navigate(signedInUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setBusy(false);
    }
  }
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-36 -top-40 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-32 h-[30rem] w-[30rem] rounded-full bg-cyan-100/60 blur-3xl" />

      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />
        <div className="p-6 sm:p-9">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-sm font-black tracking-wide text-white shadow-md shadow-blue-200">LT</div>
            <div><p className="font-bold tracking-tight text-slate-900">IIPS LabTrack</p><p className="mt-0.5 text-xs text-slate-500">Student Lab Tracking &amp; Analytics</p></div>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold text-blue-700">Welcome back</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
            <p className="mt-2 text-sm text-slate-500">Enter your IIPS account details to continue.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm font-semibold text-slate-700">Email address
              <input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="email" autoComplete="username" placeholder="name@iips.edu" required value={email} onChange={event => setEmail(event.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Password
              <input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="password" autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={event => setPassword(event.target.value)} />
            </label>
            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{error}</p>}
            <Button className="w-full py-3" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</Button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Demo admin account</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">admin@iips.edu <span className="font-normal text-slate-400">·</span> <span className="font-normal text-slate-600">admin123</span></p>
          </div>
        </div>
      </section>
      <p className="absolute bottom-4 text-center text-xs text-slate-400">International Institute of Professional Studies</p>
    </main>;
}
