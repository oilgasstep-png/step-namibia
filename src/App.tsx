import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { AdminUsersManager } from './components/AdminUsersManager';
import { exportToCSV, exportCandidateToPDF } from './utils/exportUtils';

export default function App() {
  const { user, role, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Exemplo de dados demonstrativos do projeto STEP
  const sampleCandidates = [
    {
      id: '1',
      full_name: 'Carlos Eduardo Silva',
      status: 'Aprovado',
      nationality: 'Brasileira',
      email: 'carlos.silva@exemplo.com',
      contact_phone: '+55 22 99999-1111',
      discipline: 'Operador de Guindaste',
      og_experience_years: 8,
      passport_number: 'BR123456',
      passport_expiry: '2028-12-31'
    },
    {
      id: '2',
      full_name: 'John Doe',
      status: 'Em Análise',
      nationality: 'Namibiana',
      email: 'john.doe@exemplo.com',
      contact_phone: '+264 81 123 4567',
      discipline: 'Engenheiro de Perfuração',
      og_experience_years: 12,
      passport_number: 'NM987654',
      passport_expiry: '2027-06-30'
    }
  ];

  const handleExportPDF = (candidate: any) => {
    const certs = [
      { title: 'CBSP / HUET', certificate_number: 'CERT-2024-001', issue_date: '2024-01-15', expiry_date: '2028-01-15' },
      { title: 'NR-35 Trabalho em Altura', certificate_number: 'NR35-8891', issue_date: '2024-03-10', expiry_date: '2026-03-10' }
    ];
    const medicals = [
      { exam_type: 'ASO Off-shore', clinic_name: 'Clínica Ocupacional Macaé', status: 'Apto', expiry_date: '2025-05-20' }
    ];
    exportCandidateToPDF(candidate, certs, medicals);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header / Navbar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight">STEP – Mão de Obra</h1>
          <p className="text-xs text-slate-400">Plataforma Internacional Oil & Gas</p>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">
                👤 {user.email} <strong className="text-sky-400 ml-1">({role})</strong>
              </span>
              <button
                onClick={logout}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              Entrar no Sistema
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Painel Administrativo (Exibido apenas para Admin) */}
        {user && role === 'admin' && <AdminUsersManager />}

        {/* Tabela de Candidatos e Exportação */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Candidatos Registrados</h2>
              <p className="text-xs text-slate-500">Gestão de currículos e certificados para operações offshore.</p>
            </div>

            <button
              onClick={() => exportToCSV(sampleCandidates)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <span>📄 Exportar Lista (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold uppercase">
                  <th className="p-3 rounded-l-lg">Nome</th>
                  <th className="p-3">Disciplina</th>
                  <th className="p-3">Nacionalidade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-medium text-slate-900">{c.full_name}</td>
                    <td className="p-3">{c.discipline}</td>
                    <td className="p-3">{c.nationality}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                        c.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleExportPDF(c)}
                        className="bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 text-xs font-medium px-3 py-1.5 rounded-md transition"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Login */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
