"use client";

interface CasePreviewProps {
  previewText?: string;
}

export default function CasePreview({ 
  previewText = `Señor 
JUEZ MUNICIPAL DE MEDELLÍN (REPARTO)
E. S. D. Referencia
ACCIÓN DE TUTELA
Accionante
PEDRO CASAS
Accionado
EPS SURA
Asunto de la tutela:
EPS Sura dilata la autorización de resonancia magnética
y la asignación de cita médica con el ortopedista tratante,
además de no pagar la incapacidad médica.`
}: CasePreviewProps) {
  return (
    <div className="rounded-xl border-1 bg-white mb-6 p-5">
      <p className="text-sm whitespace-pre-line">
        {previewText}
      </p>
    </div>
  );
} 