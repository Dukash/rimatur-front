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

// ✅ COMPONENTE DE STATUS DE LEITURA - ESTILO WHATSAPP
const CheckStatusIcon: React.FC<{ msg: Message; isOwn: boolean }> = ({ msg, isOwn }) => {
  if (!isOwn) return null;

  const style: React.CSSProperties = {
    fontSize: '12px',
    marginLeft: '6px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  };

  // ✅ NÃO LIDO = Dois traços CINZAS
  if (!msg.isRead) {
    return (
      <span style={{ ...style, color: '#999' }} title="Entregue">
        ✓✓
      </span>
    );
  }

  // ✅ LIDO = Dois traços AZUIS
  return (
    <span style={{ ...style, color: '#2196f3' }} title="Lido">
      ✓✓
    </span>
  );
};

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const markedAsReadRef = useRef<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ SETUP INICIAL
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

  // ✅ CARREGAR DADOS
  useEffect(() => {
    if (!userId) return;
    loadUsers();
    loadMessages(null);
  }, [userId]);

  // ✅ SCROLL AUTOMÁTICO
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // ✅ CARREGAR USUÁRIOS
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

  // ✅ CARREGAR MENSAGENS
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
      let list = Array.isArray(data) ? data : [];

      if (selectedReceiverId) {
        list = list.filter(msg =>
          (msg.sender.id === userId && msg.receiver.id === selectedReceiverId) ||
          (msg.sender.id === selectedReceiverId && msg.receiver.id === userId)
        );
      }

      setMessages(list);

      if (selectedReceiverId) {
        setConversationMessages(list);
      }
    } catch {
      // silencioso
    }
  }

  // ✅ MARCAR CONVERSA COMO LIDA - COM VALIDAÇÃO
const handleSelectConversation = async (otherUserId: number) => {
  // 🔧 VALIDAÇÃO #1 - Garantir que userId existe
  if (!userId) {
    console.error('❌ [ERRO] userId não está definido!');
    return;
  }

  // 🔧 VALIDAÇÃO #2 - Garantir que otherUserId é número válido
  if (!otherUserId || isNaN(otherUserId)) {
    console.error('❌ [ERRO] otherUserId inválido:', otherUserId);
    return;
  }

  console.log(`✅ [DEBUG] Abrindo conversa: userId=${userId}, otherUserId=${otherUserId}`);

  setSelectedUserId(otherUserId);
  const user = users.find(u => u.id === otherUserId);
  if (user) setSelectedUserName(user.name);

  // Carregar mensagens da conversa
  await loadMessages(otherUserId);

  // 🔧 MARCAR TODAS AS MENSAGENS COMO LIDAS
  try {
    const url = `http://localhost:3001/messages/conversation/read`;
    console.log(`📤 [FETCH] POST ${url}`);
    console.log(`📤 [BODY]`, { userId, otherUserId });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        otherUserId: otherUserId,
      }),
    });

    console.log(`📥 [RESPONSE] Status: ${res.status}`);

    const data = await res.json();
    console.log(`📥 [RESPONSE] Data:`, data);

    if (res.ok) {
      console.log(`✅ [SUCESSO] ${data.affected || 0} mensagens marcadas como lidas`);
      // Recarregar para atualizar status (✓✓ cinza → azul)
      await loadMessages(otherUserId);
    } else {
      console.error(`❌ [ERRO] Status ${res.status}:`, data);
    }
  } catch (err) {
    console.error('❌ [ERRO] Ao marcar como lido:', err);
  }
};

  // ✅ ENVIAR MENSAGEM
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

      const recId = receiverId ? Number(receiverId) : null;
      await loadMessages(recId);
      if (recId) {
        setSelectedUserId(recId);
        const user = users.find(u => u.id === recId);
        if (user) setSelectedUserName(user.name);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ BUSCAR HISTÓRICO
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim() || !userId) return;
    setLoading(true);
    setIsSearching(true);

    try {
      const res = await fetch(
        `http://localhost:3001/messages/history?userId=${userId}&query=${encodeURIComponent(
          search
        )}`
      );
      if (!res.ok) throw new Error('Erro ao buscar');

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setSelectedUserId(null);
      setSelectedUserName('');
      setConversationMessages([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ LIMPAR BUSCA
  const handleClearSearch = async () => {
    setSearch('');
    setIsSearching(false);
    await loadMessages(null);
    setSelectedUserId(null);
    setSelectedUserName('');
    setConversationMessages([]);
  };

  // ✅ LOGOUT
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
    }
    router.push('/login');
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

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
              <h1 className="h3 mb-0 fw-bold">💬 Sistema de Mensagens</h1>
              <small>
                Bem vindo {userName}! ID: {userId}
              </small>
            </div>
            <div className="d-flex gap-2 align-items-center">
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
            {/* Nova Mensagem */}
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

                          if (value) {
                            handleSelectConversation(value as number);
                          }
                        }}
                        required
                        style={{
                          borderColor: '#e0e0e0',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                        }}
                      >
                        <option value="">Selecionar...</option>
                        {users.map(u => {
                          const displayLabel =
                            u.role === 'gestor' ? `${u.name} (Gestor)` : u.name;
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
                        onChange={e => setSubject(e.target.value)}
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
                        onChange={e => setBody(e.target.value)}
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

            {/* Histórico e Conversa */}
            <div className="col-lg-8">
              {/* Search */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h5
                    className="card-title fw-bold mb-3"
                    style={{ color: '#88453d' }}
                  >
                    🔍 Buscar Histórico
                    {isSearching && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          marginLeft: '10px',
                          fontWeight: 'normal',
                        }}
                      >
                        (Buscando por: "{search}")
                      </span>
                    )}
                  </h5>
                  <form onSubmit={handleSearch} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-lg flex-grow-1"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
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
                      onClick={handleClearSearch}
                      disabled={loading}
                    >
                      Limpar
                    </button>
                  </form>
                </div>
              </div>

              {/* Conversa ou Lista de Mensagens */}
              {selectedUserId ? (
                // CONVERSA DETALHADA
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
                      [...conversationMessages]
                        .sort(
                          (a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                        )
                        .map(msg => (
                          <div
                            key={msg.id}
                            style={{
                              marginBottom: '12px',
                              display: 'flex',
                              justifyContent:
                                msg.sender.id === userId
                                  ? 'flex-end'
                                  : 'flex-start',
                              animation: 'fadeIn 0.3s ease-in',
                            }}
                          >
                            <div
                              style={{
                                maxWidth: '65%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                backgroundColor:
                                  msg.sender.id === userId ? '#c8e6c9' : '#fff',
                                border:
                                  msg.sender.id === userId
                                    ? 'none'
                                    : '1px solid #e0e0e0',
                                transition: 'all 0.3s ease',
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
                              <p style={{ margin: '4px 0', fontSize: '14px' }}>
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
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  'pt-BR',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                                <CheckStatusIcon
                                  msg={msg}
                                  isOwn={msg.sender.id === userId}
                                />
                              </small>
                            </div>
                          </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                // LISTA DE MENSAGENS
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
                      <div className="space-y-2">
                        {messages.map(msg => {
                          const bodyPreview =
                            msg.body.length > 80
                              ? msg.body.substring(0, 80) + '...'
                              : msg.body;

                          return (
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
                                borderColor: msg.isRead
                                  ? '#e0e0e0'
                                  : '#88453d',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                padding: '12px',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.boxShadow =
                                  '0 4px 12px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.transform =
                                  'translateY(-2px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform =
                                  'translateY(0)';
                              }}
                            >
                              <div style={{ margin: 0 }}>
                                <h6
                                  className="fw-bold mb-1"
                                  style={{ fontSize: '14px' }}
                                >
                                  {msg.isRead ? '📨' : '📬'} {msg.subject}
                                </h6>
                                <p
                                  className="text-muted small mb-2"
                                  style={{ marginBottom: '6px' }}
                                >
                                  De: {msg.sender.name}
                                </p>
                                <p
                                  className="text-muted small mb-2"
                                  style={{
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    color: '#555',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {bodyPreview}
                                </p>
                                <small
                                  className="text-muted"
                                  style={{ fontSize: '12px' }}
                                >
                                  {new Date(msg.createdAt).toLocaleString(
                                    'pt-BR',
                                    {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    }
                                  )}
                                </small>
                              </div>
                            </div>
                          );
                        })}
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}