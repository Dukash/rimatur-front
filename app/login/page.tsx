'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao fazer login');
      }

      const data = await res.json();

      // Salvar token e userId
      if (data.token && data.userId) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('userName', data.name || '');
        localStorage.setItem('userRole', data.role || 'colaborador');


        // Redirecionar para /messages
        router.push('/messages');
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="h3 mb-0 fw-bold">Sistema de Comunicação</h1>
          <small>Faça login para continuar</small>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="container-lg">
          <div className="row justify-content-center">
            <div className="col-lg-5">
              <div className="card shadow-sm border-0">
                <div className="card-body p-5">
                  <h3
                    className="card-title text-center fw-bold mb-4"
                    style={{ color: '#88453d' }}
                  >
                    Login
                  </h3>

                  {error && (
                    <div
                      className="alert alert-danger py-2 mb-4"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-500 mb-2">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-500 mb-2">Senha</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Sua senha"
                        required
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-lg w-100"
                      style={{
                        backgroundColor: '#88453d',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                      }}
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                  </form>

                  <hr className="my-3" />

                  <p className="text-center mb-0">
                    Não tem conta?{' '}
                    <Link
                      href="/register"
                      style={{ color: '#88453d', fontWeight: 600 }}
                    >
                      Cadastre-se aqui
                    </Link>
                  </p>
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
