"use client";

import { parseDateToLocal } from "@/utils/date";
import { CaseHistoryLog } from "@/types/cases";

interface CaseHistoryLogsProps {
  historyLogs: CaseHistoryLog[];
}

export default function CaseHistoryLogs({ historyLogs }: CaseHistoryLogsProps) {
  return (
    <section className="pl-3">
      <ol className="relative border-s border-gray-200">
        {historyLogs && historyLogs.length > 0 ? (
          historyLogs.map((history) => (
            <li key={history.id_historial} className="mb-16 ms-10">
              <span
                className={`${
                  history.estado_nuevo === "Aprobado"
                    ? "bg-[#12A150]"
                    : history.estado_nuevo === "Seguimiento"
                    ? "bg-primary"
                    : history.estado_nuevo === "Acción necesaria"
                    ? "bg-[#C4841D]"
                    : history.estado_nuevo === "No aprobado"
                    ? "bg-[#F31260]"
                    : "bg-primary"
                } absolute flex items-center justify-center w-7 h-7 rounded-full -start-[14px] ring-4 ring-[#e7e7e7da]`}
              ></span>
              <h3 className="flex items-center mb-1 text-sm font-semibold">
                {history.estado_nuevo}
              </h3>
              <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                {parseDateToLocal(history.fecha_cambio)}
              </time>
            </li>
          ))
        ) : (
          <li className="ms-10">
            <p className="text-sm text-gray-500">
              No hay registros de cambios de estado
            </p>
          </li>
        )}
      </ol>
    </section>
  );
} 