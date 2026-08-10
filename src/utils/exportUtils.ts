import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

export const exportToCSV = (candidates: any[]) => {
  const csvData = candidates.map(c => ({
    Nome: c.full_name,
    Status: c.status,
    Nacionalidade: c.nationality,
    Email: c.email,
    Telefone: c.contact_phone,
    Disciplina: c.discipline,
    Anos_Experiencia_OG: c.og_experience_years,
    Passaporte: c.passport_number,
    Validade_Passaporte: c.passport_expiry
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `STEP_MaoDeObra_Export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCandidateToPDF = (candidate: any, certs: any[], medicals: any[]) => {
  const doc = new jsPDF() as any;

  doc.setFillColor(13, 28, 40);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('STEP – Mão de Obra', 14, 15);
  doc.setFontSize(10);
  doc.text('Relatório Consolidado do Candidato (Oil & Gas Platform)', 14, 23);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(`Nome: ${candidate.full_name}`, 14, 40);
  doc.text(`Status: ${candidate.status}`, 14, 47);
  doc.text(`Disciplina: ${candidate.discipline}`, 14, 54);
  doc.text(`Contato: ${candidate.contact_phone} | Email: ${candidate.email}`, 14, 61);

  doc.setFontSize(14);
  doc.text('Certificações Cadastradas', 14, 75);
  
  const certRows = certs.map(c => [c.title, c.certificate_number || 'N/A', c.issue_date || 'N/A', c.expiry_date || 'N/A']);
  doc.autoTable({
    startY: 80,
    head: [['Certificado', 'Número', 'Data Emissão', 'Data Validade']],
    body: certRows,
    headStyles: { fillColor: [2, 132, 199] }
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text('Exames Médicos / ASO', 14, finalY);

  const medRows = medicals.map(m => [m.exam_type, m.clinic_name || 'N/A', m.status, m.expiry_date || 'N/A']);
  doc.autoTable({
    startY: finalY + 5,
    head: [['Exame', 'Clínica', 'Status', 'Validade']],
    body: medRows,
    headStyles: { fillColor: [16, 185, 129] }
  });

  doc.save(`Ficha_${candidate.full_name.replace(/\s+/g, '_')}.pdf`);
};
