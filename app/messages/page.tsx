'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';

type Message = {
  id: number;
  subject: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: number; name: string; email: string };
  receiver: { id: number; name: string; email: string };
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const CheckStatusIcon: React.FC<{ msg: Message; isOwn: boolean }> = ({ msg, isOwn }) => {
  if (!isOwn) return null; // só mostra check nas mensagens que EU enviei

  const style: React.CSSProperties = {
    fontSize: '11px',
    marginLeft: '6px',
  };

  // usando só isRead:
  // - não lida  -> ✓✓ cinza
  // - lida      -> ✓✓ azul
  if (!msg.isRead) {
    return <span style={{ ...style, color: '#777' }}>✓✓</span>;
  }

  return <span style={{ ...style, color: '#2196f3' }}>✓✓</span>;
};

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [search, setSearch] = useState('');

  const markedAsReadRef = useRef<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // pega dados do usuário logado via localStorage
 useEffect(() => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    router.push('/login');
    return;
  }

  const storedUserId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const storedUserName =
    typeof window !== 'undefined' ? localStorage.getItem('userName') : null;

  if (storedUserId) setUserId(Number(storedUserId));
  if (storedUserName) setUserName(storedUserName || '');
}, [router]);

  // carrega usuários e mensagens depois que o userId estiver setado
  useEffect(() => {
    if (!userId) return;
    loadUsers();
    loadMessages(null);
  }, [userId]);

  // scroll automático para o fim da conversa
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  async function loadUsers() {
    try {
      const res = await fetch('http://localhost:3001/users');
      if (!res.ok) throw new Error('Erro ao carregar usuários');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      // silencioso
    }
  }

  async function loadMessages(selectedReceiverId: number | null) {
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:3001/messages?userId=${userId}${
          selectedReceiverId ? `&receiverId=${selectedReceiverId}` : ''
        }`
      );
      if (!res.ok) throw new Error('Erro ao carregar mensagens');

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // lista geral (para o painel de mensagens)
      setMessages(list);

      // se tiver um usuário selecionado, esse retorno já é o histórico dessa conversa
      if (selectedReceiverId) {
        setConversationMessages(list);
      }
    } catch {
      // silencioso
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          senderId: userId,
          receiverId: Number(receiverId),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }

      setSubject('');
      setBody('');

      // recarrega o histórico da conversa atual (se houver)
      const recId = receiverId ? Number(receiverId) : null;
      await loadMessages(recId);
      if (recId) {
        setSelectedUserId(recId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectConversation = (otherUserId: number) => {
    setSelectedUserId(otherUserId);
    loadMessages(otherUserId);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
    }
    router.push('/login');
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim() || !userId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3001/messages?userId=${userId}&search=${encodeURIComponent(
          search
        )}`
      );
      if (!res.ok) throw new Error('Erro ao buscar');

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setSelectedUserId(null);
      setConversationMessages([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // marca como lidas
  useEffect(() => {
    const markAsRead = async (messageId: number) => {
      if (markedAsReadRef.current.has(messageId)) return;
      markedAsReadRef.current.add(messageId);

      try {
        await fetch(`http://localhost:3001/messages/${messageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        });
      } catch {
        // silencioso
      }
    };

    messages.forEach((msg) => {
      if (!msg.isRead) {
        markAsRead(msg.id);
      }
    });
  }, [messages]);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  // nome do usuário selecionado, baseado no histórico da conversa atual
  const selectedUserName =
    selectedUserId && conversationMessages.length > 0
      ? (() => {
          const example = conversationMessages.find(
            (m) =>
              m.sender.id === selectedUserId || m.receiver.id === selectedUserId
          );
          if (!example) return '';
          return example.sender.id === selectedUserId
            ? example.sender.name
            : example.receiver.name;
        })()
      : '';

  return (
    <div
      className="min-h-screen d-flex flex-column"
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <Navbar />

      {/* Header */}
      <div
        className="py-4"
        style={{
          background: 'linear-gradient(135deg, #88453d 0%, #a0554a 100%)',
          color: 'white',
        }}
      >
        <div className="container-lg">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 fw-bold">💬 Mensagens</h1>
              <small>
                {unreadCount > 0 && `${unreadCount} não lida(s) - `}
                Comunique-se com sua equipe
              </small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                👤 {userName}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid white',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                🚪 Sair
              </button>
              <Link
                href="/rotinas"
                className="btn btn-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid white',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                📋 Ir para Rotinas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-5 flex-grow-1">
        <div className="container-lg">
          <div className="row g-4">
            {/* Nova Mensagem - Esquerda */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <h5
                    className="card-title fw-bold mb-4"
                    style={{ color: '#88453d' }}
                  >
                    ✉️ Nova Mensagem
                  </h5>

                  {error && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSend}>
                    <div className="mb-3">
                      <label className="form-label fw-500 mb-2">
                        Destinatário
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={receiverId}
                        onChange={(e) => {
                          const value = e.target.value
                            ? Number(e.target.value)
                            : '';
                          setReceiverId(value as any);
                        }}
                        required
                        style={{
                          borderColor: '#e0e0e0',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                        }}
                      >
                        <option value="">Selecionar...</option>
                        {users.map((u) => {
                          const displayLabel =
                            u.role === 'gestor'
                              ? `${u.name} (Gestor)`
                              : u.name;
                          return (
                            <option key={u.id} value={u.id}>
                              {displayLabel}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-500 mb-2">Assunto</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Assunto da mensagem"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-500 mb-2">Mensagem</label>
                      <textarea
                        className="form-control"
                        placeholder="Digite sua mensagem aqui..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={5}
                        required
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !receiverId}
                      className="btn btn-lg w-100"
                      style={{
                        backgroundColor: '#88453d',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                      }}
                    >
                      {loading ? 'Enviando...' : 'Enviar Mensagem'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Histórico e Conversa - Direita */}
            <div className="col-lg-8">
              {/* Search */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h5
                    className="card-title fw-bold mb-3"
                    style={{ color: '#88453d' }}
                  >
                    🔍 Buscar Histórico
                  </h5>
                  <form onSubmit={handleSearch} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-lg flex-grow-1"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por palavra..."
                      style={{ borderColor: '#e0e0e0' }}
                    />
                    <button
                      type="submit"
                      className="btn btn-outline-secondary"
                      disabled={loading}
                    >
                      Buscar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setSearch('');
                        loadMessages(null);
                        setSelectedUserId(null);
                        setConversationMessages([]);
                      }}
                      disabled={loading}
                    >
                      Limpar
                    </button>
                  </form>
                </div>
              </div>

              {/* Conversa ou Lista de Mensagens */}
              {selectedUserId ? (
                // Conversa Detalhada
                <div className="card shadow-sm border-0">
                  <div
                    className="card-header p-3"
                    style={{
                      backgroundColor: '#fff',
                      borderColor: '#e0e0e0',
                      borderBottomWidth: '1px',
                    }}
                  >
                    <h5
                      className="fw-bold mb-0"
                      style={{ color: '#88453d' }}
                    >
                      💬 Conversa com {selectedUserName}
                    </h5>
                  </div>
                  <div
                    className="card-body p-3"
                    style={{
                      backgroundColor: '#f5f5f5',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    {conversationMessages.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <p>Nenhuma mensagem nesta conversa</p>
                      </div>
                    ) : (
                      conversationMessages.map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            marginBottom: '12px',
                            display: 'flex',
                            justifyContent:
                              msg.sender.id === userId ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '65%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              backgroundColor:
                                msg.sender.id === userId ? '#c8e6c9' : '#fff',
                              borderColor:
                                msg.sender.id === userId ? 'none' : '#e0e0e0',
                              border:
                                msg.sender.id === userId
                                  ? 'none'
                                  : '1px solid #e0e0e0',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginBottom: '4px',
                                color: '#88453d',
                              }}
                            >
                              {msg.sender.name}
                            </p>
                            <p
                              style={{ margin: '4px 0', fontSize: '14px' }}
                            >
                              {msg.body}
                            </p>
                            <small
  style={{
    opacity: 0.7,
    fontSize: '11px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }}
>
  {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}
  <CheckStatusIcon msg={msg} isOwn={msg.sender.id === userId} />
</small>

                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                // Lista de Mensagens Recentes
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    <h5
                      className="card-title fw-bold mb-3"
                      style={{ color: '#88453d' }}
                    >
                      📧 Mensagens ({messages.length})
                    </h5>

                    {messages.length === 0 ? (
                      <div className="text-center py-5">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                          📭
                        </div>
                        <p className="text-muted">Nenhuma mensagem encontrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            onClick={() =>
                              handleSelectConversation(
                                msg.sender.id === userId
                                  ? msg.receiver.id
                                  : msg.sender.id
                              )
                            }
                            className="card border"
                            style={{
                              backgroundColor: msg.isRead ? '#fff' : '#f0f7ff',
                              borderColor: msg.isRead ? '#e0e0e0' : '#88453d',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform =
                                'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.transform =
                                'translateY(0)';
                            }}
                          >
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h6 className="fw-bold mb-1">
                                    {msg.isRead ? '📨' : '📬'} {msg.subject}
                                  </h6>
                                  <p className="text-muted small mb-2">
                                    <strong>De:</strong> {msg.sender.name}
                                  </p>
                                  <p className="mb-2">{msg.body}</p>
                                  <small className="text-muted">
                                    {new Date(msg.createdAt).toLocaleString(
                                      'pt-BR'
                                    )}
                                  </small>
                                </div>
                                {!msg.isRead && (
                                  <span className="badge bg-danger">Novo</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 bg-white border-top mt-5">
        <div className="container-lg">
          <p className="text-center text-muted small mb-0">
            &copy; 2025 Sistema de Comunicação. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
