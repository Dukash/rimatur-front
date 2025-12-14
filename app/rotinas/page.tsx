'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';

type RoutineActivity = {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string | null;
  status: 'pendente' | 'em_andamento' | 'concluida';
  category: 'manutencao' | 'reuniao' | 'documento' | 'outro';
  userId: number;
  createdAt: string;
  visibility: 'pessoal' | 'time';
  createdByRole?: string;
};

const categoryEmoji: Record<string, string> = {
  manutencao: '🔧',
  reuniao: '👥',
  documento: '📄',
  outro: '📌',
};

const statusColor: Record<string, string> = {
  pendente: '#FFC107',
  em_andamento: '#00BCD4',
  concluida: '#4CAF50',
};

const statusLabel: Record<string, string> = {
  pendente: '⏳ Pendente',
  em_andamento: '⚡ Em Andamento',
  concluida: '✅ Concluída',
};

export default function RotinasPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<RoutineActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  // Routine form state
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineCategory, setRoutineCategory] = useState<
    'manutencao' | 'reuniao' | 'documento' | 'outro'
  >('outro');
  const [routineVisibility, setRoutineVisibility] = useState<'pessoal' | 'time'>('pessoal');
  const [routineStartTime, setRoutineStartTime] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const userId =
    typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null;

  const isGestor = userRole === 'gestor';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      setUserRole(role);

      if (!localStorage.getItem('token')) {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    loadActivities();
  }, [filterDate, userId]);

  async function loadActivities(date?: string) {
    if (!userId) return;

    try {
      const queryDate = date || filterDate;
      const res = await fetch(
        `http://localhost:3001/routine?userId=${userId}&date=${queryDate}`,
      );

      if (!res.ok) throw new Error('Erro ao carregar atividades');

      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erro ao carregar atividades:', err);
      setError(err.message);
    }
  }

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const startDateTime = new Date(routineStartTime);

      const res = await fetch('http://localhost:3001/routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: routineTitle,
          description: routineDescription,
          category: routineCategory,
          visibility: routineVisibility,
          startTime: startDateTime.toISOString(),
          userId,
          status: 'pendente',
          createdByRole: userRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao criar atividade');
      }

      // Reset form
      setRoutineTitle('');
      setRoutineDescription('');
      setRoutineCategory('outro');
      setRoutineVisibility('pessoal');
      setRoutineStartTime(new Date().toISOString().slice(0, 16));

      // Reload activities
      loadActivities();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Marcar atividade como concluída
  async function handleMarkAsCompleted(activity: RoutineActivity) {
    try {
      // Tarefa de TIME: só gestor pode concluir
      if (activity.visibility === 'time' && !isGestor) {
        alert('Apenas gestores podem marcar tarefas de grupo como concluídas.');
        return;
      }

      // Tarefa PESSOAL: só o dono pode concluir
      if (activity.visibility === 'pessoal' && activity.userId !== userId) {
        alert('Você só pode concluir suas próprias tarefas pessoais.');
        return;
      }

      const res = await fetch(`http://localhost:3001/routine/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluida' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao atualizar atividade');
      }

      // Recarregar lista
      await loadActivities();
    } catch (err: any) {
      console.error('Erro ao marcar como concluída:', err);
      alert(err.message || 'Erro ao marcar como concluída');
    }
  }

  const totalActivities = activities.length;
  const completedActivities = activities.filter(
    (a) => a.status === 'concluida',
  ).length;
  const completionRate =
    totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

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
              <h1 className="h3 mb-0 fw-bold">📋 Rotinas</h1>
              <small>Gerencie suas atividades diárias</small>
            </div>
            <Link
              href="/messages"
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid white',
                fontWeight: '600',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              💬 Ir para Mensagens
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-5 flex-grow-1">
        <div className="container-lg">
          {/* Stats Cards */}
          <div className="row mb-5">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 text-center p-4">
                <div className="h2 fw-bold" style={{ color: '#88453d' }}>
                  {totalActivities}
                </div>
                <small className="text-muted">atividades</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 text-center p-4">
                <div className="h2 fw-bold" style={{ color: '#4CAF50' }}>
                  {completedActivities}
                </div>
                <small className="text-muted">finalizadas</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 text-center p-4">
                <div className="h2 fw-bold" style={{ color: '#FF9800' }}>
                  {completionRate}%
                </div>
                <small className="text-muted">completadas</small>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Nova Atividade */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <h5
                    className="card-title fw-bold mb-4"
                    style={{ color: '#88453d' }}
                  >
                    ➕ Nova Atividade
                  </h5>

                  {error && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleCreateActivity}>
                    <div className="mb-3">
                      <label className="form-label fw-500 mb-2">Título</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Ex: Revisar documentos"
                        value={routineTitle}
                        onChange={(e) => setRoutineTitle(e.target.value)}
                        required
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-500 mb-2">
                        Descrição
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Detalhes..."
                        value={routineDescription}
                        onChange={(e) => setRoutineDescription(e.target.value)}
                        rows={3}
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-500 mb-2">
                        Categoria
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={routineCategory}
                        onChange={(e) =>
                          setRoutineCategory(
                            e.target.value as
                              | 'manutencao'
                              | 'reuniao'
                              | 'documento'
                              | 'outro',
                          )
                        }
                        style={{ borderColor: '#e0e0e0' }}
                      >
                        <option value="outro">🔴 Outro</option>
                        <option value="manutencao">🔧 Manutenção</option>
                        <option value="reuniao">👥 Reunião</option>
                        <option value="documento">📄 Documento</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-500 mb-2">Horário</label>
                      <input
                        type="datetime-local"
                        className="form-control form-control-lg"
                        value={routineStartTime}
                        onChange={(e) => setRoutineStartTime(e.target.value)}
                        required
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>

                    {isGestor && (
                      <div className="mb-4">
                        <label className="form-label fw-500 mb-2">
                          Visibilidade
                        </label>
                        <select
                          className="form-select form-select-lg"
                          value={routineVisibility}
                          onChange={(e) =>
                            setRoutineVisibility(
                              e.target.value as 'pessoal' | 'time',
                            )
                          }
                          style={{ borderColor: '#e0e0e0' }}
                        >
                          <option value="pessoal">🔒 Pessoal</option>
                          <option value="time">👥 Time</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !routineTitle}
                      className="btn btn-lg w-100"
                      style={{
                        backgroundColor: '#88453d',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                      }}
                    >
                      {loading ? 'Adicionando...' : 'Adicionar'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Lista de Atividades */}
            <div className="col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5
                      className="card-title fw-bold mb-0"
                      style={{ color: '#88453d' }}
                    >
                      📅 Atividades
                    </h5>
                    <input
                      type="date"
                      className="form-control"
                      style={{ width: '200px', borderColor: '#e0e0e0' }}
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>

                  {activities.length === 0 ? (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        📭
                      </div>
                      <p className="text-muted">Nenhuma atividade</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="card border"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor:
                              statusColor[activity.status] || '#ccc',
                            marginBottom: '12px',
                          }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="fw-bold mb-1">
                                  {categoryEmoji[activity.category]}{' '}
                                  {activity.title}
                                </h6>
                                <p className="text-muted small mb-2">
                                  {activity.description}
                                </p>
                                <small className="text-muted d-block mb-1">
                                  ⏰{' '}
                                  {new Date(
                                    activity.startTime,
                                  ).toLocaleString('pt-BR')}
                                </small>

                                {activity.visibility === 'time' && (
                                  <small className="badge bg-info mt-1">
                                    👥 Time
                                  </small>
                                )}
                              </div>

                              <div className="d-flex flex-column align-items-end gap-2">
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor:
                                      statusColor[activity.status],
                                    color: 'white',
                                  }}
                                >
                                  {statusLabel[activity.status]}
                                </span>

                                {activity.status !== 'concluida' && (
                                  <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() =>
                                      handleMarkAsCompleted(activity)
                                    }
                                    disabled={
                                      (activity.visibility === 'pessoal' &&
                                        activity.userId !== userId) ||
                                      (activity.visibility === 'time' &&
                                        !isGestor)
                                    }
                                    title={
                                      activity.visibility === 'pessoal' &&
                                      activity.userId !== userId
                                        ? 'Você só pode concluir suas tarefas pessoais'
                                        : activity.visibility === 'time' &&
                                          !isGestor
                                        ? 'Apenas gestores podem concluir tarefas de grupo'
                                        : 'Marcar como concluída'
                                    }
                                    style={{
                                      backgroundColor: '#4CAF50',
                                      color: 'white',
                                      fontWeight: 600,
                                      opacity:
                                        (activity.visibility === 'pessoal' &&
                                          activity.userId !== userId) ||
                                        (activity.visibility === 'time' &&
                                          !isGestor)
                                          ? 0.5
                                          : 1,
                                    }}
                                  >
                                    ✓ Concluir
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
