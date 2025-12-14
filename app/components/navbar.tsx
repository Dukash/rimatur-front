'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('userName');
      
      setIsLoggedIn(!!token);
      if (name) {
        setUserName(name);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
    }
    setIsLoggedIn(false);
    setUserName('');
    router.push('/login');
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div className="container-lg">
        <Link
          className="navbar-brand d-flex align-items-center justify-content-center"
          href="/"
          style={{ flex: 1 }}
        >
          <Image
            src="/rimatur_logo.jpg"
            alt="Rimatur"
            width={180}
            height={60}
            priority
            style={{ height: 'auto' }}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <span className="nav-link" style={{ cursor: 'default' }}>
                    👤 {userName}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="nav-link btn btn-link"
                    style={{
                      color: '#88453d',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem 1rem',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6d3530';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#88453d';
                    }}
                  >
                    🚪 Sair
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/">
                    HOME
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/login">
                    LOGIN
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
