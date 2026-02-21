'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

export function SaveRecipientPrompt({ tasteProfile, sessionId, onSaved }) {
  const { data: session } = useSession();
  const [state, setState] = useState('idle'); // idle | auth | label | saving | done
  const [label, setLabel] = useState(
    tasteProfile?.recipient?.name || tasteProfile?.recipient?.relationship || ''
  );
  const [error, setError] = useState('');

  // After returning from Google OAuth, auto-open label input if save was pending
  useEffect(() => {
    if (session?.user && sessionStorage.getItem('pendingSave')) {
      sessionStorage.removeItem('pendingSave');
      setState('label');
    }
  }, [session]);

  const handleSaveClick = () => {
    if (session?.user) {
      setState('label');
    } else {
      setState('auth');
    }
  };

  const handleGoogleSignIn = () => {
    // Store intent so we auto-open label input after redirect back
    sessionStorage.setItem('pendingSave', '1');
    signIn('google', { callbackUrl: window.location.href });
  };

  const handleSave = async () => {
    if (!label.trim()) return;
    setState('saving');
    setError('');

    try {
      const endpoint = sessionId ? '/api/recipients/from-session' : '/api/recipients';
      const body = sessionId
        ? { sessionId, label: label.trim() }
        : { label: label.trim(), tasteProfile };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
        setState('label');
        return;
      }

      setState('done');
      onSaved?.();
    } catch {
      setError('Something went wrong');
      setState('label');
    }
  };

  if (state === 'done') {
    return (
      <div className="flex items-center gap-3 animate-fade-up">
        <span className="text-sm text-copper font-medium">Saved!</span>
        <a
          href="/dashboard"
          className="text-sm text-warm-gray-light hover:text-foreground underline transition-colors"
        >
          View dashboard
        </a>
      </div>
    );
  }

  if (state === 'auth') {
    return (
      <div className="bg-white/[0.05] border border-border rounded-2xl p-5 max-w-sm animate-fade-up">
        <p className="text-sm text-foreground font-medium mb-3">Sign in to save her profile</p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.08] border border-border text-sm font-medium text-foreground hover:bg-white/[0.14] transition-all cursor-pointer mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-2">
          <a
            href={`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
            className="flex-1 text-center px-4 py-2.5 rounded-xl bg-white/[0.08] border border-border text-sm text-foreground hover:bg-white/[0.14] transition-all"
          >
            Sign in with email
          </a>
        </div>

        <button
          onClick={() => setState('idle')}
          className="w-full text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    );
  }

  if (state === 'label' || state === 'saving') {
    return (
      <div className="flex items-center gap-2 animate-fade-up">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='Label (e.g., "Mom")'
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-copper w-44"
        />
        <button
          onClick={handleSave}
          disabled={!label.trim() || state === 'saving'}
          className="px-4 py-2 rounded-lg bg-copper text-white text-sm font-semibold hover:bg-copper/90 transition-all disabled:opacity-50 cursor-pointer"
        >
          {state === 'saving' ? '...' : 'Save'}
        </button>
        <button
          onClick={() => setState('idle')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  // idle state — just the save button
  return (
    <button
      onClick={handleSaveClick}
      className="flex items-center gap-1.5 text-sm text-warm-gray-light hover:text-foreground transition-colors cursor-pointer px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-copper/30"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
        <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>Save</span>
    </button>
  );
}
