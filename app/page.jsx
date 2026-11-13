'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  { icon: '📝', title: 'Summarize', text: 'Summarize this document in simple words' },
  { icon: '🎯', title: 'Key points', text: 'What are the most important points I should know?' },
  { icon: '📅', title: 'Dates & numbers', text: 'List the key dates, deadlines, amounts and figures' },
  { icon: '📖', title: 'Explain terms', text: 'Explain the difficult or technical terms used here' },
];
const LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil'];

/* ---------- Small inline icons (no extra dependencies) ---------- */
const Icon = {
  upload: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" />
    </svg>
  ),
  stack: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 3 8l9 5 9-5z" /><path d="m3 13 9 5 9-5" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" />
    </svg>
  ),
};

/* ---------- Answer formatting: paragraphs, "-" bullets, clickable [S1] citations ---------- */
function withCitations(line, onCite) {
  const parts = line.split(/(\[S\d+\](?:\s*,?\s*\[S\d+\])*)/g);
  return parts.map((part, i) => {
    const nums = [...part.matchAll(/\[S(\d+)\]/g)].map((m) => Number(m[1]));
    if (!nums.length) return <Fragment key={i}>{part}</Fragment>;
    return (
      <span key={i} className="cites">
        {nums.map((n) => (
          <button key={n} type="button" className="cite" onClick={() => onCite(n)} title={`Show source ${n}`}>
            {n}
          </button>
        ))}
      </span>
    );
  });
}

function FormattedAnswer({ text, onCite }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className="answer">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim());
        const isList = lines.length > 0 && lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{withCitations(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ''), onCite)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {/^\s*[-*•]\s+/.test(l) ? '• ' : ''}
                {withCitations(l.replace(/^\s*[-*•]\s+/, ''), onCite)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function AssistantMessage({ m, id }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(false);
  const refs = useRef({});

  function cite(n) {
    setOpen(true);
    setActive(n);
    requestAnimationFrame(() => refs.current[n]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="msg assistant">
      <div className="avatar" aria-hidden="true">✨</div>
      <div className="msg-body">
        <div className="bubble">
          <FormattedAnswer text={m.text} onCite={cite} />
        </div>
        <div className="msg-actions">
          <button type="button" className="ghost-btn" onClick={copy}>
            {copied ? Icon.check : Icon.copy}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {m.sources?.length > 0 && (
            <button
              type="button"
              className="ghost-btn"
              aria-expanded={open}
              aria-controls={`${id}-sources`}
              onClick={() => setOpen((o) => !o)}
            >
              {Icon.file}
              {open ? 'Hide sources' : `${m.sources.length} sources`}
            </button>
          )}
        </div>
        {open && m.sources?.length > 0 && (
          <div className="sources" id={`${id}-sources`}>
            {m.sources.map((s) => (
              <div
                key={s.n}
                ref={(el) => (refs.current[s.n] = el)}
                className={`source ${active === s.n ? 'active' : ''}`}
              >
                <div className="source-head">
                  <span className="source-n">{s.n}</span>
                  <span className="source-doc" title={s.docName}>{s.docName}</span>
                  <span className="source-page">p. {s.page}</span>
                </div>
                <p>{s.text.slice(0, 400)}{s.text.length > 400 ? '…' : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/* ---------- Page ---------- */
export default function Home() {
  const [docs, setDocs] = useState([]);
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [docId, setDocId] = useState('all');
  const [language, setLanguage] = useState('English');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState([]); // [{ name, status: 'working' | 'error', error }]
  const [error, setError] = useState(null); // { text, retry? }
  const [confirmId, setConfirmId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const dragDepth = useRef(0);

  const uploading = uploads.some((u) => u.status === 'working');
  const scopeDoc = docs.find((d) => d.id === docId);

  async function loadDocs() {
    try {
      const res = await fetch('/api/docs');
      const data = await res.json();
      setDocs(data.docs ?? []);
    } finally {
      setDocsLoaded(true);
    }
  }

  useEffect(() => {
    loadDocs();
    try {
      const saved = localStorage.getItem('lde-language');
      if (saved && LANGUAGES.includes(saved)) setLanguage(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lde-language', language);
    } catch {}
  }, [language]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  // Auto-grow the question box
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [question]);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  async function upload(files) {
    const list = Array.from(files ?? []);
    if (!list.length || uploading) return;
    const pdfs = list.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    const rejected = list.filter((f) => !f.name.toLowerCase().endsWith('.pdf'));

    setUploads([
      ...pdfs.map((f) => ({ name: f.name, status: 'working' })),
      ...rejected.map((f) => ({ name: f.name, status: 'error', error: 'Only PDF files are supported' })),
    ]);

    let lastId = null;
    for (const file of pdfs) {
      const form = new FormData();
      form.append('file', file);
      let failure = null;
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok) failure = data.error || 'Upload failed';
        else lastId = data.doc?.id ?? lastId;
      } catch {
        failure = 'Network error';
      }
      setUploads((u) =>
        failure
          ? u.map((x) => (x.name === file.name ? { ...x, status: 'error', error: failure } : x))
          : u.filter((x) => x.name !== file.name),
      );
    }
    if (fileRef.current) fileRef.current.value = '';
    await loadDocs();
    // Focus the newly uploaded doc if it is the only one uploaded
    if (lastId && pdfs.length === 1) setDocId(lastId);
  }

  async function remove(id) {
    setConfirmId(null);
    await fetch(`/api/docs?id=${id}`, { method: 'DELETE' });
    if (docId === id) setDocId('all');
    loadDocs();
  }

  async function ask(q) {
    const text = q.trim();
    if (!text || loading || !docs.length) return;
    const history = messages.map(({ role, text }) => ({ role, text }));
    setQuestion('');
    setError(null);
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          docId: docId === 'all' ? undefined : docId,
          language,
          history,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((m) => [...m, { role: 'assistant', text: data.answer, sources: data.sources }]);
    } catch (e) {
      // Drop the unanswered question so retry doesn't duplicate it
      setMessages((m) => m.slice(0, -1));
      setError({ text: e instanceof Error && e.message ? e.message : 'Something went wrong', retry: text });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function selectScope(id) {
    setDocId(id);
    setDrawerOpen(false);
    inputRef.current?.focus();
  }

  function newChat() {
    setMessages([]);
    setError(null);
    setQuestion('');
    inputRef.current?.focus();
  }

  // Page-wide drag & drop
  const dropHandlers = {
    onDragEnter: (e) => {
      if (!e.dataTransfer?.types?.includes('Files')) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    },
    onDragOver: (e) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      upload(e.dataTransfer.files);
    },
  };

  const hasDocs = docs.length > 0;
  const placeholder = !hasDocs
    ? 'Upload a PDF to start asking questions'
    : scopeDoc
      ? `Ask about ${scopeDoc.name}…`
      : 'Ask a question about your documents…';

  return (
    <div className="layout" {...dropHandlers}>
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <div className="drop-card">
            {Icon.upload}
            <strong>Drop PDFs to upload</strong>
            <span>They will be added to your library</span>
          </div>
        </div>
      )}

      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}

      {/* ---------- Sidebar ---------- */}
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`} aria-label="Documents">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">📄</div>
          <div>
            <div className="brand-name">Doc Explainer</div>
            <div className="brand-tag">Plain-language answers</div>
          </div>
          <button className="icon-btn drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            {Icon.close}
          </button>
        </div>

        <label className={`dropzone ${uploading ? 'busy' : ''}`}>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={(e) => upload(e.target.files)}
            disabled={uploading}
          />
          <span className="dropzone-icon">{uploading ? <span className="spinner" /> : Icon.upload}</span>
          <span className="dropzone-text">
            <strong>{uploading ? 'Processing…' : 'Upload PDF'}</strong>
            <span>{uploading ? 'Reading and indexing pages' : 'Click or drag & drop'}</span>
          </span>
        </label>

        {uploads.length > 0 && (
          <ul className="upload-list" aria-live="polite">
            {uploads.map((u) => (
              <li key={u.name} className={u.status}>
                {u.status === 'working' ? <span className="spinner small" /> : <span className="dot-error">!</span>}
                <div>
                  <div className="truncate" title={u.name}>{u.name}</div>
                  {u.error && <div className="upload-error">{u.error}</div>}
                </div>
                {u.status === 'error' && (
                  <button
                    className="icon-btn"
                    onClick={() => setUploads((x) => x.filter((y) => y.name !== u.name))}
                    aria-label="Dismiss"
                  >
                    {Icon.close}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="section-label">
          <span>Search in</span>
          {hasDocs && <span className="count">{docs.length}</span>}
        </div>

        {!docsLoaded ? (
          <div className="skeleton-list">
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : !hasDocs ? (
          <p className="hint">No documents yet. Upload a report, manual, contract, paper or any other PDF.</p>
        ) : (
          <ul className="doc-list" role="listbox" aria-label="Choose which documents to search">
            <li>
              <button
                role="option"
                aria-selected={docId === 'all'}
                className={`doc-item ${docId === 'all' ? 'selected' : ''}`}
                onClick={() => selectScope('all')}
              >
                <span className="doc-icon">{Icon.stack}</span>
                <span className="doc-meta">
                  <span className="doc-name">All documents</span>
                  <span className="doc-sub">{docs.length} file{docs.length === 1 ? '' : 's'}</span>
                </span>
              </button>
            </li>
            {docs.map((d) => (
              <li key={d.id} className="doc-row">
                {confirmId === d.id ? (
                  <div className="confirm">
                    <span>Remove this document?</span>
                    <div>
                      <button className="btn-danger" onClick={() => remove(d.id)}>Remove</button>
                      <button className="btn-plain" onClick={() => setConfirmId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      role="option"
                      aria-selected={docId === d.id}
                      className={`doc-item ${docId === d.id ? 'selected' : ''}`}
                      onClick={() => selectScope(d.id)}
                    >
                      <span className="doc-icon">{Icon.file}</span>
                      <span className="doc-meta">
                        <span className="doc-name" title={d.name}>{d.name}</span>
                        <span className="doc-sub">
                          {d.pages} pages{d.addedAt ? ` · ${formatDate(d.addedAt)}` : ''}
                        </span>
                      </span>
                    </button>
                    <button
                      className="icon-btn doc-delete"
                      onClick={() => setConfirmId(d.id)}
                      aria-label={`Remove ${d.name}`}
                      title="Remove"
                    >
                      {Icon.trash}
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="disclaimer">
          Answers come only from your documents. <strong>Double-check important details</strong>. This is not professional advice.
        </p>
      </aside>

      {/* ---------- Chat ---------- */}
      <main className="chat">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open documents">
            {Icon.menu}
          </button>
          <button className="scope-pill" onClick={() => setDrawerOpen(true)} title="Change which documents to search">
            {scopeDoc ? Icon.file : Icon.stack}
            <span className="truncate">{scopeDoc ? scopeDoc.name : 'All documents'}</span>
          </button>
          <div className="topbar-actions">
            <label className="lang-select" title="Answer language">
              {Icon.globe}
              <span className="sr-only">Answer in</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            {messages.length > 0 && (
              <button className="btn-outline" onClick={newChat} disabled={loading}>
                {Icon.plus}
                <span className="hide-sm">New chat</span>
              </button>
            )}
          </div>
        </header>

        <div className="messages" aria-live="polite">
          {messages.length === 0 && (
            <div className="empty">
              {!docsLoaded ? null : !hasDocs ? (
                <>
                  <div className="empty-icon">📄</div>
                  <h1>Understand any document</h1>
                  <p>
                    Upload a report, contract, manual, research paper, policy or notice. Ask questions and
                    get answers in plain language, with page references.
                  </p>
                  <button className="btn-primary big" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <span className="spinner small light" /> : Icon.upload}
                    {uploading ? 'Processing…' : 'Upload your first PDF'}
                  </button>
                  <ol className="steps">
                    <li><span>1</span>Upload a PDF</li>
                    <li><span>2</span>Ask in your own words</li>
                    <li><span>3</span>Check the cited pages</li>
                  </ol>
                </>
              ) : (
                <>
                  <h1>What would you like to know?</h1>
                  <p>
                    Searching <strong>{scopeDoc ? scopeDoc.name : `all ${docs.length} document${docs.length === 1 ? '' : 's'}`}</strong>
                    {' '}· answers in <strong>{language}</strong>
                  </p>
                  <div className="suggestions">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.text} className="suggestion" onClick={() => ask(s.text)}>
                        <span className="suggestion-icon">{s.icon}</span>
                        <span>
                          <strong>{s.title}</strong>
                          <span>{s.text}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="msg user">
                <div className="bubble">{m.text}</div>
              </div>
            ) : (
              <AssistantMessage key={i} m={m} id={`m${i}`} />
            ),
          )}

          {loading && (
            <div className="msg assistant">
              <div className="avatar" aria-hidden="true">✨</div>
              <div className="msg-body">
                <div className="bubble thinking">
                  <span className="dots"><i /><i /><i /></span>
                  Reading the documents…
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error" role="alert">
              <div>
                <strong>Couldn't get an answer.</strong> {error.text}
              </div>
              <div className="error-actions">
                {error.retry && (
                  <button className="btn-plain" onClick={() => ask(error.retry)}>Try again</button>
                )}
                <button className="icon-btn" onClick={() => setError(null)} aria-label="Dismiss error">
                  {Icon.close}
                </button>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="composer-wrap">
          <form
            className={`composer ${!hasDocs ? 'disabled' : ''}`}
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  ask(question);
                }
              }}
              placeholder={placeholder}
              disabled={!hasDocs}
              aria-label="Your question"
            />
            <button
              type="submit"
              className="send"
              disabled={!question.trim() || loading || !hasDocs}
              aria-label="Ask"
            >
              {loading ? <span className="spinner small light" /> : Icon.send}
            </button>
          </form>
          <div className="composer-hint">
            <span><kbd>Enter</kbd> to ask · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line</span>
            <span>Answers come only from your documents</span>
          </div>
        </div>
      </main>
    </div>
  );
}
