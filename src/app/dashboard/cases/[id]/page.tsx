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

  const caseData = await fetchCaseById(parseInt(id));
  const historyLogs = await fetchCaseHistory(parseInt(id));

  if (!caseData) {
    return <div>Caso no encontrado</div>;
  }

  return (
    <main>
      <div key={caseData.id_caso}>
        <CaseHeader caseData={caseData} />

        <section className="flex gap-6">
          <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
            <div className="p-5">
              <h2 className="text-xl font-medium">Caso n# - 2259689498</h2>
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
            <NotesSection />
            
            <section className="mt-5">
              <h2 className="font-medium mb-4">Mensajes</h2>
              <ul className="flex flex-col gap-6">
                {/* Add messages here if needed */}
              </ul>
            </section>
            
            <hr className="my-5" />
            <p className="font-medium mb-8">Registro de cambios de estado</p>

            <CaseHistoryLogs historyLogs={historyLogs || []} />
          </aside>
        </section>
      </div>
    </main>
  );
}
