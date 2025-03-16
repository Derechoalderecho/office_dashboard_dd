import {
  Breadcrumbs,
  BreadcrumbItem,
  Chip,
  Button,
  Textarea,
} from "@heroui/react";
import Link from "next/link";
import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { parseDateToLocal } from "@/utils/date";
import { fetchCasesByCitizenId, fetchCaseHistory } from "@/services/caseService";
import React from "react";

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

  try {
    const casesData = await fetchCasesByCitizenId(parseInt(id));
    
    if (!casesData || casesData.length === 0) {
      return <div>Case not found</div>;
    }

    // For each case, fetch its history
    const casesWithHistory = await Promise.all(
      casesData.map(async (caseItem) => {
        const historyLogs = await fetchCaseHistory(caseItem.id_caso);
        return { ...caseItem, historyLogs };
      })
    );

    console.log(casesWithHistory);

    return (
      <div>
        {casesWithHistory.map((caseItem) => (
          <div key={caseItem.id_caso}>
            <Breadcrumbs className="mb-5">
              <BreadcrumbItem>
                <Link href="/cases">Casos</Link>
              </BreadcrumbItem>
              <BreadcrumbItem>{`Vista de caso N#${caseItem.id_caso}`}</BreadcrumbItem>
            </Breadcrumbs>
            <section className="flex items-center justify-between pb-4 mb-7 border-b-1">
              <div>
                <div className="flex gap-4 items-center mb-1">
                  <h1 className="text-4xl font-medium">INV4257-09-011</h1>
                  <Chip
                    className={`Capitalize ${
                      caseItem.estado === "Aprobado"
                        ? "bg-success text-[#12A150]"
                        : caseItem.estado === "Seguimiento"
                        ? "bg-followed text-[#006FEE]"
                        : caseItem.estado === "Acción necesaria"
                        ? "bg-warning text-[#C4841D]"
                        : caseItem.estado === "No aprobado"
                        ? "bg-error text-[#F31260]"
                        : ""
                    }`}
                    size="sm"
                    variant="flat"
                  >
                    {caseItem.estado}
                  </Chip>
                </div>
                <p className="text-sm text-secondary">
                  {parseDateToLocal(caseItem.fecha_crea)}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <Button
                  color="primary"
                  startContent={<DocumentArrowUpIcon className="w-6" />}
                >
                  Elevar Instancia
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    color="secondary"
                    variant="bordered"
                    startContent={<PencilSquareIcon className="w-6" />}
                  >
                    Editar documento
                  </Button>
                  <Button
                    className="border-[#12A150] text-[#12A150]"
                    variant="bordered"
                    startContent={
                      <ClipboardDocumentCheckIcon className="w-6 text-[#12A150]" />
                    }
                  >
                    Aprobar envío
                  </Button>
                </div>
              </div>
            </section>

            <section className="flex gap-6">
              <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
                <div className="p-5">
                  <h2 className="text-xl font-medium">Caso n# - 2259689498</h2>
                  <hr className="my-4" />
                  <section className="flex justify-between">
                    <div className="flex flex-col gap-5">
                      <article className="flex items-center gap-8">
                        <p className="text-secondary w-28 max-w-28 text-sm">
                          Nombre{" "}
                        </p>
                        <span className="text-sm">
                          {caseItem.ciudadano.primer_nombre}{" "}
                          {caseItem.ciudadano.primer_apellido}
                        </span>
                      </article>
                      <article className="flex items-center gap-8">
                        <p className="text-secondary w-28 max-w-28 text-sm">
                          Correo
                        </p>
                        <span className="text-sm">
                          {caseItem.ciudadano.email}
                        </span>
                      </article>
                      <article className="flex items-center gap-8">
                        <p className="text-secondary w-28 max-w-28 text-sm">
                          Teléfono
                        </p>
                        <span className="text-sm">
                          {caseItem.ciudadano.num_movil}
                        </span>
                      </article>
                      <article className="flex items-center gap-8">
                        <p className="text-secondary w-28 max-w-28 text-sm">
                          Documento
                        </p>
                        <span className="text-sm">
                          {caseItem.ciudadano.num_documento}
                        </span>
                      </article>
                    </div>
                    <div className="flex flex-col gap-5">
                      <article className="flex items-center gap-8">
                        <p className="text-secondary w-28 max-w-28 text-sm text-nowrap">
                          N# de registro
                        </p>
                        <span className="text-sm">{caseItem.id_caso}</span>
                      </article>
                      <article className="flex items-center gap-8">
                        <p className="text-secondary w-28 max-w-28 text-sm">
                          Creado en
                        </p>
                        <span className="text-sm">
                          {parseDateToLocal(caseItem.fecha_crea)}
                        </span>
                      </article>
                      <article className="flex items-center gap-8">
                        <p className="text-secondary w-28 max-w-28 text-sm">
                          Ultima actualización
                        </p>
                        <span className="text-sm">
                          {parseDateToLocal(caseItem.fecha_actualiza)}
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
                  <hr className="my-4" />
                  <h6 className="font-medium text-lg mb-4">
                    Previsualización de la tutela
                  </h6>
                  <div className="rounded-xl border-1 bg-white mb-6 p-5">
                    <p className="text-sm">
                      Señor <br /> JUEZ MUNICIPAL DE MEDELLÍN (REPARTO)
                      <br /> E. S. D. Referencia
                      <br />
                      ACCIÓN DE TUTELA
                      <br /> Accionante
                      <br /> PEDRO CASAS
                      <br /> Accionado
                      <br /> EPS SURA
                      <br />
                      Asunto de la tutela:
                      <br /> EPS Sura dilata la autorización de resonancia
                      magnética y la asignación de cita médica con el
                      ortopedista tratante, además de no pagar la incapacidad
                      médica.
                    </p>
                  </div>
                  <section>
                    <div className="flex flex-col justify-center items-center mb-10">
                      <h4 className="font-medium">
                        Cargue o descargue la tutela
                      </h4>
                      <span className="text-sm text-secondary">
                        Archivo debe ser docx, pdf
                      </span>
                    </div>
                    <div className="flex gap-5">
                      <div className="flex items-center justify-center w-[35%]">
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center px-5 justify-center w-full h-64 border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <CloudArrowDownIcon className="w-12 h-12 text-gray-400" />
                            <p className="mb-2 text-sm text-center text-gray-500">
                              Click para{" "}
                              <span className="font-bold">descargar</span> el
                              archivo
                            </p>
                            <p className="text-xs text-gray-500">docx, pdf</p>
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              Click para{" "}
                              <span className="font-bold">subir</span> el
                              archivo
                            </p>
                            <p className="text-xs text-gray-500">docx, pdf</p>
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
              <aside className="w-[30%]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Notas</p>
                    <Button
                      startContent={
                        <LinkIcon className="w-[18px] text-primary" />
                      }
                      variant="light"
                      className="text-primary"
                    >
                      Añadir nota
                    </Button>
                  </div>
                  <Textarea
                    minRows={6}
                    variant="bordered"
                    placeholder="Escribe tu nota y presiona añadir nota para guardarla"
                  />
                </div>
                <section className="mt-5">
                  <h2 className="font-medium mb-4">Mensajes</h2>
                  <ul className="flex flex-col gap-6">
                    {/* Add messages here if needed */}
                  </ul>
                </section>
                <hr className="my-5" />
                <p className="font-medium mb-8">Registro de cambios de estado</p>

                <section className="pl-3">
                  <ol className="relative border-s border-gray-200">
                    {caseItem.historyLogs && caseItem.historyLogs.map((history, index) => (
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
                    ))}
                    
                    {(!caseItem.historyLogs || caseItem.historyLogs.length === 0) && (
                      <li className="ms-10">
                        <p className="text-sm text-gray-500">No hay registros de cambios de estado</p>
                      </li>
                    )}
                  </ol>
                </section>
              </aside>
            </section>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading case:", error);
    return <div>Error loading case</div>;
  }
}
