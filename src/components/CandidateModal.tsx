import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Trash2, Download, UserCheck } from 'lucide-react';

export interface CandidateDoc {
  id?: string;
  name: string;
  url: string;
  created_at?: string;
}

export interface Candidate {
  id?: string;
  name: string;
  status: string;
  role: string;
  email: string;
  phone: string;
  doc_id: string;
  city: string;
  photo_url?: string;
  docs?: CandidateDoc[];
}

interface Props {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const CandidateModal: React.FC<Props> = ({ candidate, isOpen, onClose, onSaveSuccess }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'docs'>('general');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Candidate>({
    name: '',
    status: 'Disponível',
    role: '',
    email: '',
    phone: '',
    doc_id: '',
    city: '',
    photo_url: '',
    docs: []
  });

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
    } else {
      setFormData({
        name: '',
        status: 'Disponível',
        role: '',
        email: '',
        phone: '',
        doc_id: '',
        city: '',
        photo_url: '',
        docs: []
      });
    }
  }, [candidate, isOpen]);

  if (!isOpen) return null;

  // Upload da Foto para o Supabase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('candidate-files')
      .upload(filePath, file);

    if (uploadError) {
      alert('Erro ao enviar imagem: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from('candidate-files').getPublicUrl(filePath);
    setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
    setLoading(false);
  };

  // Upload de Documentos para o Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const filePath = `docs/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('candidate-files')
      .upload(filePath, file);

    if (uploadError) {
      alert('Erro ao enviar documento: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from('candidate-files').getPublicUrl(filePath);
    const newDoc: CandidateDoc = {
      name: file.name,
      url: data.publicUrl
    };

    setFormData(prev => ({ ...prev, docs: [...(prev.docs || []), newDoc] }));
    setLoading(false);
  };

  const removeDoc = (index: number) => {
    setFormData(prev => ({
      ...prev,
      docs: prev.docs?.filter((_, i) => i !== index)
    }));
  };

  // Salvar no Banco PostgreSQL do Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.id) {
      const { error } = await supabase
        .from('candidates')
        .update(formData)
        .eq('id', formData.id);
      if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
      const { error } = await supabase
        .from('candidates')
        .insert([formData]);
      if (error) alert('Erro ao cadastrar: ' + error.message);
    }

    setLoading(false);
    onSaveSuccess();
    onClose();
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (confirm('Deseja realmente excluir este candidato do Supabase?')) {
      setLoading(true);
      await supabase.from('candidates').delete().eq('id', formData.id);
      setLoading(false);
      onSaveSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 bg-slate-200 rounded-xl overflow-hidden border flex items-center justify-center">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-slate-400 font-bold">Sem Foto</span>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-sky-600 cursor-pointer hover:underline block">
                {loading ? 'Carregando...' : 'Alterar Foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={loading} />
              </label>
              <input
                type="text"
                placeholder="Nome Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="font-bold text-lg border-b outline-none w-full"
              />
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-slate-50/50 px-4 gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 ${activeTab === 'general' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent'}`}
          >
            Dados Gerais
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 border-b-2 ${activeTab === 'docs' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent'}`}
          >
            Anexos no Supabase ({formData.docs?.length || 0})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 mb-1 block">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none"
                  >
                    <option value="Trabalhando Conosco">Trabalhando Conosco</option>
                    <option value="Disponível">Disponível</option>
                    <option value="Em Entrevista">Em Entrevista</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 mb-1 block">Cargo / Função</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 mb-1 block">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 mb-1 block">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 mb-1 block">CPF / Passaporte</label>
                  <input
                    type="text"
                    value={formData.doc_id}
                    onChange={(e) => setFormData({ ...formData, doc_id: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 mb-1 block">Cidade / Estado</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sky-900">Anexar Documento no Cloud Storage</p>
                  <p className="text-[11px] text-sky-700">Envia o arquivo diretamente para o Supabase Storage</p>
                </div>
                <label className="bg-sky-600 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Anexar</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={loading} />
                </label>
              </div>

              <div className="space-y-2">
                {formData.docs?.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-100 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{doc.name}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-sky-600 font-bold hover:underline flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> Abrir
                      </a>
                      <button onClick={() => removeDoc(idx)} className="text-rose-600 hover:text-rose-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between bg-slate-50">
          {formData.id && (
            <button onClick={handleDelete} disabled={loading} className="bg-rose-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          )}
          <button onClick={handleSubmit} disabled={loading} className="bg-sky-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1 ml-auto">
            <UserCheck className="w-4 h-4" /> {loading ? 'Salvando...' : 'Salvar no Supabase'}
          </button>
        </div>
      </div>
    </div>
  );
};