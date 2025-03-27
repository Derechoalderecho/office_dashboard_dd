import { Chip, Button, Textarea } from "@heroui/react";

import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { parseDateToLocal } from "@/utils/date";
import { fetchCaseById, fetchCaseHistory } from "@/services/caseService";
import CaseHeader from "@/components/cases/cases-id/CaseHeader";
import CaseInfo from "@/components/cases/cases-id/CaseInfo";
import CasePreview from "@/components/cases/cases-id/CasePreview";
import DocumentsSection from "@/components/cases/cases-id/DocumentsSection";
import NotesSection from "@/components/cases/cases-id/NotesSection";
import CaseHistoryLogs from "@/components/cases/cases-id/CaseHistoryLogs";

interface CasePageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseId = parseInt(id);

  // Verificar que el ID del caso sea válido
  if (isNaN(caseId)) {
    console.error(`ID de caso no válido: ${id}`);
    return <div>ID de caso no válido</div>;
  }

  console.log(`Cargando caso ID: ${caseId}`);

  const caseData = await fetchCaseById(caseId);
  const historyLogs = await fetchCaseHistory(caseId);

  if (!caseData) {
    console.error(`Caso con ID ${caseId} no encontrado`);
    return <div>Caso no encontrado</div>;
  }

  // Log detallado para verificar notas en el caso
  if (caseData.notas_list) {
    console.log(
      `El caso tiene ${caseData.notas_list.length} notas precargadas`
    );
    if (caseData.notas_list.length > 0) {
      console.log(
        `Primera nota: ID=${
          caseData.notas_list[0].id_nota
        }, Mensaje="${caseData.notas_list[0].mensaje.substring(0, 30)}..."`
      );
    }
  } else {
    console.log("El caso no tiene notas precargadas (notas_list es undefined)");
  }

  // Asegurarse de que notas_list siempre sea un array, incluso si es undefined
  const notasList = caseData.notas_list || [];
  console.log(`Pasando ${notasList.length} notas al componente NotesSection`);

  return (
    <main>
      <div key={caseData.id_caso}>
        <CaseHeader caseData={caseData} />

        <section className="flex gap-6">
          <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
            <div className="p-5">
              <h2 className="text-xl font-medium">
                Caso n# - {caseData.id_caso}
              </h2>
              <hr className="my-4" />

              <CaseInfo caseData={caseData} />

              <hr className="my-4" />
              <h6 className="font-medium text-lg mb-4">
                Previsualización de la tutela
              </h6>

              <CasePreview />

              <DocumentsSection caseId={caseData.id_caso} />
            </div>
          </div>
          <aside className="w-[30%]">
            <NotesSection caseId={caseData.id_caso} initialNotes={notasList} />

            <hr className="my-5" />
            <p className="font-medium mb-8">Registro de cambios de estado</p>

            <CaseHistoryLogs historyLogs={historyLogs || []} />
          </aside>
        </section>
      </div>
    </main>
  );
}
