import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AdminUsersManager = () => {
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setUsers(data);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    loadUsers();
  };

  return (
    <div className="glass-card p-6 rounded-2xl max-w-4xl mx-auto my-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span>🛡️ Painel de Administração de Acessos</span>
      </h2>
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-100 uppercase font-semibold text-slate-600">
          <tr>
            <th className="p-3">Nome Completo</th>
            <th className="p-3">ID do Usuário</th>
            <th className="p-3">Perfil de Acesso</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map(u => (
            <tr key={u.id}>
              <td className="p-3 font-medium">{u.full_name}</td>
              <td className="p-3 font-mono text-slate-400">{u.id}</td>
              <td className="p-3">
                <select 
                  value={u.role} 
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="apple-select text-xs py-1 px-2"
                >
                  <option value="viewer">Visualização (Apenas Leitura)</option>
                  <option value="recruitment">Recrutamento (Edição/Operação)</option>
                  <option value="admin">Administração (Acesso Total)</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
