import { useState } from 'react';
import { login } from '../api/store';

export default function Login({ onLogin }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const doLogin = (code) => {
    try { onLogin(login(code)); } catch (e) { setError(e.message); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] mb-3">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.35-9.5-8.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6.5C19 16.65 12 21 12 21z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Saath</h1>
          <p className="text-slate-500 mt-1">Care, together. Quiet until it matters.</p>
        </div>
        <div className="space-y-3 mb-6">
          <button onClick={()=>doLogin('SAATH-ELDER')} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E2E8F0] hover:border-[#0F766E] hover:bg-teal-50/30 active:scale-[0.99] transition duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#0F766E] min-h-[52px]">
            <div className="w-11 h-11 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-semibold">MS</div>
            <div>
              <div className="font-semibold text-slate-900">Mrs. Sharma</div>
              <div className="text-sm text-slate-500">Elder · SAATH-ELDER</div>
            </div>
          </button>
          <button onClick={()=>doLogin('SAATH-HELP')} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E2E8F0] hover:border-[#0F766E] hover:bg-teal-50/30 active:scale-[0.99] transition duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#0F766E] min-h-[52px]">
            <div className="w-11 h-11 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold">R</div>
            <div>
              <div className="font-semibold text-slate-900">Riya</div>
              <div className="text-sm text-slate-500">Helper · SAATH-HELP</div>
            </div>
          </button>
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); doLogin(passcode.trim());}} className="space-y-3 border-t border-[#E2E8F0] pt-5">
          <label className="block text-sm font-medium text-slate-600">Or enter passcode</label>
          <div className="flex gap-2">
            <input value={passcode} onChange={e=>setPasscode(e.target.value)} className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]" placeholder="Passcode" />
            <button className="bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2.5 rounded-xl font-medium transition duration-150 min-h-[52px]">Login</button>
          </div>
          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        </form>
      </div>
    </div>
  );
}
