"use client";

import { parseDateToLocal } from "@/utils/date";
import { ApiHistoryLog } from "@/types/cases";
import { getCaseStatusStyles } from "@/utils/caseStatusStyles";

interface CaseHistoryLogsProps {
  historyLogs: ApiHistoryLog[];
}

export default function CaseHistoryLogs({ historyLogs }: CaseHistoryLogsProps) {
  return (
    <section className="pl-3">
      <ol className="relative border-s border-gray-200">
        {historyLogs && historyLogs.length > 0 ? (
          historyLogs.map((history) => (
            <li key={history.id_historial_estado_caso} className="mb-16 ms-10">
              <span
                className={`${getCaseStatusStyles(history.estado_actual, "indicator")} absolute flex items-center justify-center w-7 h-7 rounded-full -start-[14px] ring-4 ring-[#e7e7e7da]`}
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