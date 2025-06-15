"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
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
  ArrowsUpDownIcon, 
  MagnifyingGlassIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon, 
  XCircleIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  XMarkIcon
} from "@heroicons/react/24/outline";
import { DocumentResponse, downloadDocument } from "@/actions/uploadDocsActions";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDocuments } from '@/store/slices/documentSlice';
import { fetchCase } from '@/store/slices/caseSlice';
import { parseDateToLocal } from "@/utils/date";
import { API_BASE_URL } from "@/config/api";
import { getDocumentsByCaseIdAndType } from "@/services/documentService";

type SortOption = "newest" | "oldest" | "name" | "type";

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  refreshFlag?: boolean;
  onRefreshed?: () => void;
}

export default function DocumentsModal({ 
  isOpen, 
  onClose, 
  caseId,
  refreshFlag = false,
  onRefreshed
}: DocumentsModalProps) {
  const dispatch = useAppDispatch();
  const { documents, loading, error } = useAppSelector((state) => state.document);
  const { currentCase, loading: caseLoading } = useAppSelector((state) => state.case);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentResponse[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedType, setSelectedType] = useState<'Docx' | 'MD' | 'Tutela' | 'Radicado' | 'Otro'>('Docx');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadingError, setHasLoadingError] = useState(false);

  // Función para cargar documentos que se puede llamar cuando hay un error
  const reloadDocuments = async () => {
    try {
      const numericCaseId = parseInt(caseId, 10);
      if (isNaN(numericCaseId)) {
        throw new Error('ID de caso inválido');
      }
      
      setIsLoading(true);
      setHasLoadingError(false);
      
      try {
        const docs = await getDocumentsByCaseIdAndType(numericCaseId, selectedType);
        dispatch(setDocuments(docs));
        console.log(`Documentos cargados: ${docs.length} (tipo: ${selectedType})`);
      } catch (error: any) {
        console.error("Error al cargar documentos:", error);
        if (error.status === 404 || (error.message && error.message.includes("404"))) {
          // Para errores 404, mostramos una lista vacía en lugar de error
          dispatch(setDocuments([]));
        } else {
          setHasLoadingError(true);
        }
      } finally {
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error obteniendo documentos:", error.message);
      setIsLoading(false);
      setHasLoadingError(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    reloadDocuments();
  }, [isOpen, caseId, dispatch, selectedType]);

  useEffect(() => {
    if (isOpen && refreshFlag) {
      try {
        console.log("Refrescando documentos del caso...");
        
        const numericCaseId = parseInt(caseId, 10);
        if (!isNaN(numericCaseId)) {
          setIsLoading(true);
          setHasLoadingError(false);
          
          (async () => {
            try {
              const docs = await getDocumentsByCaseIdAndType(numericCaseId, selectedType);
              
              console.log(`Documentos actualizados: ${docs.length} (tipo: ${selectedType})`);
              
              dispatch(setDocuments(docs));
              setFilteredDocuments(sortDocuments(docs, sortBy));
            } catch (error: any) {
              console.error("Error al actualizar documentos:", error);
              if (error.status === 404 || (error.message && error.message.includes("404"))) {
                dispatch(setDocuments([]));
                setFilteredDocuments([]);
              } else {
                setHasLoadingError(true);
              }
            } finally {
              setIsLoading(false);
              
              if (onRefreshed) {
                onRefreshed();
              }
            }
          })();
        } else {
          if (onRefreshed) onRefreshed();
        }
      } catch (error) {
        console.error("Error al refrescar documentos:", error);
        setHasLoadingError(true);
        setIsLoading(false);
        if (onRefreshed) onRefreshed();
      }
    }
  }, [isOpen, refreshFlag, caseId, dispatch, onRefreshed, sortBy, selectedType]);

  useEffect(() => {
    if (currentCase?.documentos && isOpen) {
      dispatch(setDocuments(currentCase.documentos));
      setFilteredDocuments(sortDocuments(currentCase.documentos, sortBy));
      setHasLoadingError(false);
    }
  }, [currentCase, isOpen, dispatch, sortBy]);

  useEffect(() => {
    if (documents.length > 0) {
      let filtered = documents;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = documents.filter(doc => 
          doc.nombre_documento?.toLowerCase().includes(term) ||
          (doc.ext_documento ? doc.ext_documento.toLowerCase().includes(term) : false)
        );
      }
      
      setFilteredDocuments(sortDocuments(filtered, sortBy));
    } else {
      setFilteredDocuments([]);
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
        return sorted.sort((a, b) => {
          const extA = a.ext_documento || '';
          const extB = b.ext_documento || '';
          return extA.localeCompare(extB);
        });
      default:
        return sorted;
    }
  };

  const handleDownload = async (document: DocumentResponse) => {
    setDownloadingId(document.id_documento);
    
    try {
      // Obtener la URL firmada del API usando el nuevo endpoint
      const idDocumentoCaso = document.id_documento_caso || document.id_documento;
      const apiUrl = `${API_BASE_URL}/documentos/caso/${idDocumentoCaso}/download`;
      console.log(`Descargando documento con id: ${idDocumentoCaso}. URL: ${apiUrl}`);
      
      const response = await axios.get(apiUrl);
      
      if (response.status !== 200 || !response.data.url_firmada) {
        throw new Error(`No se encontró la URL firmada en la respuesta`);
      }
      
      const signedUrl = response.data.url_firmada;
      console.log('URL firmada obtenida:', signedUrl);
      
      // Abrir la URL firmada en una nueva pestaña
      window.open(signedUrl, '_blank');
      
      addToast({
        title: "Descarga iniciada",
        description: `${document.nombre_documento}${document.ext_documento} se está descargando`,
        color: "success"
      });
      
      setDownloadingId(null);
    } catch (error: any) {
      console.error("Error en la descarga:", error);
      
      // Mensaje más específico según el error
      let errorMessage = "No se pudo descargar el documento";
      
      if (error.response) {
        // Respuesta del servidor con un código de error
        const statusCode = error.response.status;
        console.error(`Error ${statusCode}:`, error.response.data);
        
        if (statusCode === 404) {
          errorMessage = "El documento no fue encontrado en el servidor";
        } else if (statusCode === 403) {
          errorMessage = "No tienes permisos para descargar este documento";
        } else if (statusCode >= 500) {
          errorMessage = "Error en el servidor, intenta más tarde";
        }
      } else if (error.request) {
        // No se recibió respuesta
        errorMessage = "No se pudo conectar con el servidor, verifica tu conexión";
      }
      
      addToast({
        title: "Error de descarga",
        description: errorMessage,
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
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {(loading || isLoading) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center rounded-lg">
            <Spinner size="lg" color="primary" />
          </div>
        )}
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Documentos del caso</h2>
            <Chip color="primary" variant="flat">
              {documents.length} Documentos
            </Chip>
          </div>
        </ModalHeader>
        
        <ModalBody className="overflow-y-auto max-h-[500px]">
          {/* Siempre mostramos el selector de tipos, independientemente de si hay documentos */}
          <div className="flex flex-col gap-3 mb-4">
            {/* Selector de tipo de documento, siempre visible */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Tipo de documento</p>
              <div className="flex flex-wrap gap-2">
                <Chip 
                  variant={selectedType === 'Docx' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('Docx')}
                >
                  Docx
                </Chip>
                <Chip 
                  variant={selectedType === 'MD' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('MD')}
                >
                  MD
                </Chip>
                <Chip 
                  variant={selectedType === 'Tutela' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('Tutela')}
                >
                  Tutela
                </Chip>
                <Chip 
                  variant={selectedType === 'Radicado' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('Radicado')}
                >
                  Radicado
                </Chip>
                <Chip 
                  variant={selectedType === 'Otro' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('Otro')}
                >
                  Otro
                </Chip>
              </div>
            </div>

            {/* Controles de búsqueda y ordenación, solo visibles si hay documentos */}
            {documents.length > 0 && !loading && !isLoading && !hasLoadingError && (
              <div className="flex flex-col sm:flex-row gap-3">
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
          </div>
          
          {loading || isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : hasLoadingError ? (
            <div className="flex flex-col justify-center items-center py-12 gap-4">
              <XCircleIcon className="w-12 h-12 text-danger" />
              <p>Error al cargar los documentos</p>
              <Button
                color="primary"
                variant="flat"
                startContent={<ArrowPathIcon className="w-4 h-4" />}
                onClick={reloadDocuments}
              >
                Reintentar
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 gap-4">
              <DocumentTextIcon className="w-12 h-12 text-gray-400" />
              <p className="text-center text-gray-600">
                No hay documentos de tipo <span className="font-semibold">{selectedType}</span>
              </p>
              <p className="text-sm text-gray-500 text-center">
                Puedes seleccionar otro tipo de documento usando los botones de arriba
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id_documento} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">{doc.nombre_documento}{doc.ext_documento || ''}</p>
                      <p className="text-sm text-gray-500">
                        Subido el {parseDateToLocal(doc.fecha_subida || doc.fecha_asigna)}
                        {doc.subido_por && ` por ${doc.subido_por}`}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={(doc.ext_documento && doc.ext_documento === '.pdf') ? 'danger' : 'primary'}
                        >
                          {doc.ext_documento ? doc.ext_documento.substring(1).toUpperCase() : 'DESCONOCIDO'}
                        </Chip>
                        {doc.tipo_documento && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="secondary"
                          >
                            {doc.tipo_documento}
                          </Chip>
                        )}
                      </div>
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