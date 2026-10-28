import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  WifiOff,
} from 'lucide-react';
import { deleteMessage, fetchMessages, saveMessage, type Message } from '@/api';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await fetchMessages());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Loading messages failed for an unknown reason.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) {
      setError('Saving message failed: Please type a message before clicking Save message.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveMessage(trimmed);
      setInput('');
      await loadMessages();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Saving message failed for an unknown reason.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteMessage(id);
      await loadMessages();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Deleting message failed for an unknown reason.');
    } finally {
      setDeletingId(null);
    }
  };

  const isConnectionError = error?.includes('Could not connect to the backend');

  return (
    <main className="app-shell">
      <div className="background-grid" aria-hidden="true" />
      <div className="glow glow-one" aria-hidden="true" />
      <div className="glow glow-two" aria-hidden="true" />

      <div className="app-content">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-icon"><Sparkles size={20} strokeWidth={2.2} /></div>
            <div>
              <p className="eyebrow">BUILD / LEARN / CONNECT</p>
              <p className="brand-name">First Full-Stack App</p>
            </div>
          </div>
          <div className="connection-pill"><span className="status-dot" /> Local workspace</div>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-kicker"><span /> Your first data journey</div>
            <h1>Turn a thought into <span>stored data.</span></h1>
            <p className="hero-description">
              Type a message, send it through your app, and watch it travel from React to Express and into MongoDB Atlas.
            </p>
          </div>
          <div className="stack-visual" aria-label="Frontend, backend, and database connection">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="stack-node node-react"><span>01</span><MessageSquareText size={21} /> React</div>
            <div className="stack-node node-express"><span>02</span><Send size={19} /> Express</div>
            <div className="stack-node node-db"><span>03</span><Database size={19} /> MongoDB</div>
          </div>
        </section>

        <section className="workspace-card">
          <div className="section-heading">
            <div>
              <div className="title-with-icon"><MessageSquareText size={19} /><h2>Message board</h2></div>
              <p>Every message below is saved in your database.</p>
            </div>
            <div className="saved-count"><span>{messages.length}</span> saved</div>
          </div>

          <form onSubmit={handleSubmit} className="message-form">
            <label htmlFor="message-input" className="sr-only">Your message</label>
            <input
              id="message-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Write your first message..."
              disabled={saving}
            />
            <button type="submit" disabled={saving} className="save-button">
              {saving ? <LoaderCircle size={17} className="spin" /> : <Send size={17} />}
              {saving ? 'Saving' : 'Save message'}
            </button>
          </form>

          {error && (
            <div className="error-banner" role="alert">
              <div className="error-icon">{isConnectionError ? <WifiOff size={19} /> : <AlertTriangle size={19} />}</div>
              <div className="error-copy">
                <strong>{isConnectionError ? 'Backend connection problem' : 'Request could not be completed'}</strong>
                <span>{error}</span>
              </div>
              {isConnectionError && (
                <button type="button" className="retry-button" onClick={() => void loadMessages()}>
                  <RefreshCw size={15} /> Retry
                </button>
              )}
            </div>
          )}

          <div className="messages-area">
            {loading ? (
              <div className="empty-state"><LoaderCircle size={24} className="spin" /><p>Loading your messages...</p></div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><MessageSquareText size={25} /></div>
                <h3>Your board is ready</h3>
                <p>Send a message above and it will appear here.</p>
              </div>
            ) : (
              <ul className="message-list">
                {messages.map((message, index) => (
                  <li key={message._id} className="message-item" style={{ '--item-delay': `${index * 70}ms` } as React.CSSProperties}>
                    <div className="message-badge"><CheckCircle2 size={17} /></div>
                    <div className="message-content">
                      <p>{message.text}</p>
                      <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time>
                    </div>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => void handleDelete(message._id)}
                      disabled={deletingId === message._id}
                      aria-label={`Delete message: ${message.text}`}
                    >
                      {deletingId === message._id ? <LoaderCircle size={16} className="spin" /> : <Trash2 size={16} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <footer className="learning-footer">
          <span className="footer-line" />
          <span>React <b>→</b> Express <b>→</b> Mongoose <b>→</b> MongoDB Atlas</span>
          <span className="footer-line" />
        </footer>
      </div>
    </main>
  );
}

export default App;
