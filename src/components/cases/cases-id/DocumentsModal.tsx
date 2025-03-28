"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Spinner,
  Chip, 
  Input,
  Select,
  SelectItem,
  addToast
} from "@heroui/react";
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  XMarkIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import { DocumentResponse, downloadDocument } from "@/actions/uploadDocsActions";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDocuments } from '@/store/slices/documentSlice';
import { fetchCase } from '@/store/slices/caseSlice';
import { parseDateToLocal } from "@/utils/date";

type SortOption = "newest" | "oldest" | "name" | "type";

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export default function DocumentsModal({ isOpen, onClose, caseId }: DocumentsModalProps) {
  const dispatch = useAppDispatch();
  const { documents, loading, error } = useAppSelector((state) => state.document);
  const { currentCase } = useAppSelector((state) => state.case);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentResponse[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!isOpen || dataFetchedRef.current) return;
      
      try {
        // Convertir caseId a número y obtener documentos a través de Redux
        const numericCaseId = parseInt(caseId, 10);
        if (isNaN(numericCaseId)) {
          throw new Error('ID de caso inválido');
        }
        
        dataFetchedRef.current = true;
        await dispatch(fetchCase(numericCaseId));
      } catch (error: any) {
        console.error("Error obteniendo documentos:", error.message);
      }
    };

    loadDocuments();
    
    // Reset the ref when modal is closed or component unmounts
    return () => {
      if (!isOpen) {
        dataFetchedRef.current = false;
      }
    };
  }, [isOpen, caseId, dispatch]);

  useEffect(() => {
    if (currentCase?.documentos && isOpen) {
      dispatch(setDocuments(currentCase.documentos));
      setFilteredDocuments(sortDocuments(currentCase.documentos, "newest"));
    }
  }, [currentCase, isOpen, dispatch]);

  useEffect(() => {
    if (documents.length > 0) {
      let filtered = documents;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = documents.filter(doc => 
          doc.nombre_documento.toLowerCase().includes(term) ||
          doc.ext_documento.toLowerCase().includes(term)
        );
      }
      
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
      const response = await downloadDocument(document.id_documento);
      
      if (response.success && response.data && response.fileName) {
        // Crear URL para el blob y descargar
        const url = window.URL.createObjectURL(response.data);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = response.fileName;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
        
        addToast({
          title: "Descarga iniciada",
          description: `${response.fileName} se está descargando`,
          color: "success"
        });
      } else {
        throw new Error(response.error || 'Error al descargar el documento');
      }
      
      setDownloadingId(null);
    } catch (error: any) {
      console.error("Error en la descarga:", error);
      // Mostrar mensaje de error usando toast
      addToast({
        title: "Error de descarga",
        description: error.message || "No se pudo descargar el documento",
        color: "danger"
      });
      setDownloadingId(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      classNames={{
        footer: "border-t-[1px] border-gray-200",
      }}
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
        
        <ModalBody className="overflow-y-auto max-h-[500px]">
          {!loading && !error && documents.length > 0 && (
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
          
          {loading ? (
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