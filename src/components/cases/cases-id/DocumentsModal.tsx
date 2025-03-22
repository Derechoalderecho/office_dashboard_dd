"use client";

import { useState, useEffect } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Spinner,
  Chip, 
  addToast,
  Input,
  Select,
  SelectItem
} from "@heroui/react";
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  XMarkIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import { DocumentResponse } from "@/actions/uploadDocsActions";
import { fetchCaseById } from "@/services/caseService";
import { parseDateToLocal } from "@/utils/date";

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number;
}

type SortOption = "newest" | "oldest" | "name" | "type";

export default function DocumentsModal({ isOpen, onClose, caseId }: DocumentsModalProps) {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener documentos directamente del fetchCaseById
        console.log(`Obteniendo documentos para el caso ${caseId} desde fetchCaseById...`);
        const caseData = await fetchCaseById(caseId);
        
        if (caseData && caseData.documentos) {
          // Mapear los documentos de la respuesta a DocumentResponse si es necesario
          const docsFromCase = caseData.documentos as DocumentResponse[];
          console.log(`Se encontraron ${docsFromCase.length} documentos en el caso`);
          
          setDocuments(docsFromCase);
          setFilteredDocuments(sortDocuments(docsFromCase, "newest"));
        } else {
          console.log('No se encontraron documentos en la respuesta del caso');
          setDocuments([]);
          setFilteredDocuments([]);
        }
      } catch (error: any) {
        const errorMsg = error.message || "Error al cargar documentos";
        console.error("Error obteniendo documentos:", errorMsg);
        setError(errorMsg);
        addToast({
          title: "Error",
          description: errorMsg,
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [isOpen, caseId]);

  useEffect(() => {
    // Filter and sort documents when search term or sort option changes
    if (documents.length > 0) {
      let filtered = documents;
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = documents.filter(doc => 
          doc.nombre_documento.toLowerCase().includes(term) ||
          doc.ext_documento.toLowerCase().includes(term)
        );
      }
      
      // Apply sorting
      setFilteredDocuments(sortDocuments(filtered, sortBy));
    }
  }, [searchTerm, sortBy, documents]);

  const sortDocuments = (docs: DocumentResponse[], sortOption: SortOption): DocumentResponse[] => {
    const sorted = [...docs];
    
    switch (sortOption) {
      case "newest":
        return sorted.sort((a, b) => 
          new Date(b.fecha_asigna).getTime() - new Date(a.fecha_asigna).getTime()
        );
      case "oldest":
        return sorted.sort((a, b) => 
          new Date(a.fecha_asigna).getTime() - new Date(b.fecha_asigna).getTime()
        );
      case "name":
        return sorted.sort((a, b) => 
          a.nombre_documento.localeCompare(b.nombre_documento)
        );
      case "type":
        return sorted.sort((a, b) => 
          a.ext_documento.localeCompare(b.ext_documento)
        );
      default:
        return sorted;
    }
  };

  const handleDownload = async (document: DocumentResponse) => {
    setDownloadingId(document.id_documento);
    
    try {
      // Usar directamente el enlace del documento en lugar de hacer una solicitud adicional
      console.log(`Descargando documento desde el enlace: ${document.enlace}`);
      
      // Crear un anclaje temporal para descargar el archivo
      const link = document.enlace;
      const fileName = `${document.nombre_documento}${document.ext_documento}`;
      
      // Abrir el enlace en una nueva pestaña/ventana
      window.open(link, '_blank');
      
      // Mostrar toast de éxito
      addToast({
        title: "Descarga iniciada",
        description: `La descarga de ${fileName} ha comenzado`,
        color: "success",
      });
    } catch (error: any) {
      // Mostrar toast de error
      addToast({
        title: "Error al descargar",
        description: error.message || "Ha ocurrido un error al intentar descargar el documento",
        color: "danger",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSortChange = (value: string) => {
    // Mapea el índice seleccionado a una opción de ordenamiento
    const sortOptions: SortOption[] = ["newest", "oldest", "name", "type"];
    if (sortOptions.includes(value as SortOption)) {
      setSortBy(value as SortOption);
    } else {
      console.warn(`Opción de ordenamiento no reconocida: ${value}`);
      setSortBy("newest"); // Valor por defecto
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Documentos del caso</h2>
            <Chip color="primary" variant="flat">
              {documents.length} Documentos
            </Chip>
          </div>
        </ModalHeader>
        
        <ModalBody>
          {!isLoading && !error && documents.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onValueChange={handleSearch}
                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                className="flex-grow"
              />
              <Select
                label="Ordenar por"
                onChange={(e) => handleSortChange(e.target.value)}
                startContent={<ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />}
                className="w-full sm:w-auto sm:min-w-[180px]"
                defaultSelectedKeys={["newest"]}
              >
                <SelectItem key="newest">Más recientes</SelectItem>
                <SelectItem key="oldest">Más antiguos</SelectItem>
                <SelectItem key="name">Nombre</SelectItem>
                <SelectItem key="type">Tipo</SelectItem>
              </Select>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ExclamationCircleIcon className="w-12 h-12 text-danger mb-4" />
              <p className="text-danger">{error}</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-gray-500">No se encontraron documentos con ese término de búsqueda</p>
              ) : (
                <p className="text-gray-500">No hay documentos disponibles para este caso</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id_documento} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">{doc.nombre_documento}{doc.ext_documento}</p>
                      <p className="text-sm text-gray-500">
                        Subido el {parseDateToLocal(doc.fecha_asigna)}
                      </p>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={doc.ext_documento === '.pdf' ? 'danger' : 'primary'}
                        className="mt-1"
                      >
                        {doc.ext_documento.substring(1).toUpperCase()}
                      </Chip>
                    </div>
                  </div>
                  <Button
                    color="primary"
                    isLoading={downloadingId === doc.id_documento}
                    spinner={<Spinner size="sm" color="white" />}
                    onPress={() => handleDownload(doc)}
                    startContent={<ArrowDownTrayIcon className="w-5 h-5" />}
                    className="sm:self-end"
                  >
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="light" 
            onPress={onClose}
            startContent={<XMarkIcon className="w-5 h-5" />}
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 