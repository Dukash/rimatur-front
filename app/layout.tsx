import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

const customStyles = `
  .bg-secondary {
    background-color: #88453d !important;
  }
  .form-control, .form-select {
    background-color: #ffffff;
    border-color: #88453d;
  }
  .btn-primary {
    background-color: #88453d;
    border-color: #88453d;
  }
  .btn-primary:hover {
    background-color: #6b3530;
  }
  .card {
    background-color: #ffffff;
  }
`;

export const metadata = {
  title: 'Sistema de Mensagens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <style>{customStyles}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}