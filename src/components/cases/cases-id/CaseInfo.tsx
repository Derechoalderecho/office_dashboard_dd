"use client";

import { parseDateToLocal } from "@/utils/date";
import { CompleteCaseData, ApiCiudadano } from "@/types/cases";

interface CaseInfoProps {
  caseData: CompleteCaseData;
}

export default function CaseInfo({ caseData }: CaseInfoProps) {
  return (
    <section className="flex justify-between">
      <div className="flex flex-col gap-5">
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm">
            Nombre{" "}
          </p>
          <span className="text-sm">
            {caseData.ciudadano.primer_nombre}{" "}
            {caseData.ciudadano.primer_apellido}
          </span>
        </article>
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm">
            Correo
          </p>
          <span className="text-sm">
            {caseData.ciudadano.email || "No disponible"}
          </span>
        </article>
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm">
            Teléfono
          </p>
          <span className="text-sm">
            {caseData.ciudadano.num_movil || "No disponible"}
          </span>
        </article>
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm">
            Documento
          </p>
          <span className="text-sm">
            {caseData.ciudadano.num_documento || "No disponible"}
          </span>
        </article>
      </div>
      <div className="flex flex-col gap-5">
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm text-nowrap">
            N# de registro
          </p>
          <span className="text-sm">{caseData.id_caso}</span>
        </article>
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm">
            Creado en
          </p>
          <span className="text-sm">
            {parseDateToLocal(caseData.created_date || "")}
          </span>
        </article>
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm">
            Ultima actualización
          </p>
          <span className="text-sm">
            {parseDateToLocal(caseData.modified_date)}
          </span>
        </article>
        <article className="flex items-center gap-8">
          <p className="text-secondary w-28 max-w-28 text-sm">
            Notas
          </p>
          <span className="text-sm">-</span>
        </article>
      </div>
    </section>
  );
} 