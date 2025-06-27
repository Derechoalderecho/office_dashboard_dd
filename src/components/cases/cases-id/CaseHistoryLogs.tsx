"use client";

import { parseDateToLocal } from "@/utils/date";
import { ApiHistoryLog } from "@/types/cases";
import classNames from "classnames";

interface CaseHistoryLogsProps {
  historyLogs: ApiHistoryLog[];
}

export default function CaseHistoryLogs({ historyLogs }: CaseHistoryLogsProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Aprobado":
        return "bg-green-600";
      case "Seguimiento":
        return "bg-blue-600";
      case "Acción necesaria":
        return "bg-yellow-600";
      case "No aprobado":
        return "bg-red-600";
      case "Viabilidad":
        return "bg-purple-600";
      case "Pendiente":
        return "bg-orange-600";
      case "Revisar tutela":
        return "bg-amber-600";
      case "Radicar":
        return "bg-emerald-600";
      case "Espera del juez":
        return "bg-sky-600";
      case "Valoración del asesor":
        return "bg-teal-600";
      case "Revisión de viabilidad":
        return "bg-amber-600";
      case "Elaboración tutela":
        return "bg-orange-600";
      case "En revisión":
        return "bg-amber-600";
      case "Pendiente de radicación":
        return "bg-emerald-600";
      default:
        return "bg-gray-600";
    }
  };
  return (
    <section className="pl-3">
      <ol className="relative border-s border-gray-200">
        {historyLogs && historyLogs.length > 0 ? (
          [...historyLogs].reverse().map((history) => (
            <li key={history.id_historial_estado_caso} className="mb-16 ms-10">
              <span
                className={classNames(
                  getStatusColor(history.estado_actual),
                  "absolute flex items-center justify-center w-7 h-7 rounded-full -start-[14px] ring-4 ring-[#e7e7e7da]"
                )}
              ></span>
              <h3 className="flex items-center mb-1 text-sm font-semibold">
                {history.estado_actual}
              </h3>
              <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                {parseDateToLocal(history.created_date)}
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