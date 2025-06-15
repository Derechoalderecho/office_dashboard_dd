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
  Input,
  Select,
  SelectItem,
  addToast
} from "@heroui/react";
import { 
  ArrowsUpDownIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  XCircleIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDocuments } from '@/store/slices/documentSlice';
import { parseDateToLocal } from "@/utils/date";
import { DocumentResponse, getDocumentsByCaseIdAndType, downloadDocument } from "@/services/allDocumentsService";
import { fetchUserDetails } from "@/services/userService";

type SortOption = "newest" | "oldest" | "name" | "type";

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  refreshFlag?: boolean;
  onRefreshed?: () => void;
}

// Caché para almacenar información de usuarios y evitar múltiples consultas
const userCache = new Map<string, {
  nombre: string;
  timestamp: number;
}>();

// Tiempo de validez de la caché: 1 hora
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Obtiene el nombre completo de un usuario a partir de su ID
 */
async function getUserFullName(userId: string): Promise<string> {
  if (!userId) {
    console.log("ID de usuario vacío");
    return "Usuario desconocido";
  }
  
  console.log(`Obteniendo nombre para usuario con ID: ${userId}`);
  
  // Comprobar si está en caché y no ha expirado
  const cached = userCache.get(userId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log(`Usando nombre en caché para ${userId}: ${cached.nombre}`);
    return cached.nombre;
  }
  
  try {
    console.log(`Llamando a API para obtener detalles del usuario ${userId}`);
    const userDetails = await fetchUserDetails(userId);
    
    if (!userDetails) {
      console.log(`No se encontraron detalles para el usuario ${userId}`);
      return "Usuario desconocido";
    }
    
    console.log(`Detalles recibidos para usuario ${userId}:`, userDetails);
    
    // Formar el nombre completo
    const nombreCompleto = [
      userDetails.primer_nombre,
      userDetails.segundo_nombre,
      userDetails.primer_apellido,
      userDetails.segundo_apellido
    ].filter(Boolean).join(" ");
    
    console.log(`Nombre completo generado para ${userId}: ${nombreCompleto}`);
    
    // Guardar en caché
    userCache.set(userId, {
      nombre: nombreCompleto || "Usuario desconocido",
      timestamp: Date.now()
    });
    
    return nombreCompleto || "Usuario desconocido";
  } catch (error) {
    console.error(`Error al obtener detalles del usuario ${userId}:`, error);
    return "Usuario desconocido";
  }
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
  const [selectedType, setSelectedType] = useState<'Docx' | 'Tutela' | 'Radicado' | 'Otro'>('Docx');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  // Guardar los nombres de usuarios para cada documento
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});

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

  // Effect para filtrar documentos basado en el término de búsqueda y ordenación
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
  }, [documents, searchTerm, sortBy]);

  // Effect para cargar los nombres de usuarios cuando cambia la lista de documentos
  useEffect(() => {
    const loadUserNames = async () => {
      // Recolectamos los IDs de usuario únicos
      const uniqueUserIds = [...new Set(
        documents
          .filter(doc => doc.subido_por) // Solo documentos con usuario
          .map(doc => doc.subido_por!)
      )];
      
      console.log("IDs de usuarios únicos:", uniqueUserIds);
      
      // Obtenemos los nombres para cada ID de usuario
      const userPromises = uniqueUserIds.map(async (userId) => {
        const fullName = await getUserFullName(userId);
        return { userId, fullName };
      });

      const userResults = await Promise.all(userPromises);
      const newUserNames: {[key: string]: string} = {};
      
      // Guardamos el nombre para cada ID de usuario
      userResults.forEach(result => {
        newUserNames[result.userId] = result.fullName;
      });
      
      console.log("Nombres de usuarios obtenidos:", newUserNames);
      
      setUserNames(newUserNames);
    };

    if (documents.length > 0) {
      loadUserNames();
    }
  }, [documents]);

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

  const handleDownload = async (doc: DocumentResponse) => {
    setDownloadingId(doc.id_documento);
    
    try {
      console.log(`Iniciando descarga del documento: ${doc.nombre_documento}`);
      
      // Usar el nuevo servicio para descargar el documento
      const result = await downloadDocument(doc);
      
      if (result.success && result.data && result.fileName) {
        // Crear un objeto URL para el blob
        const url = window.URL.createObjectURL(result.data);
        
        // Crear un elemento <a> temporal para la descarga
        const a = window.document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        window.document.body.appendChild(a);
        a.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
        
        addToast({
          title: "Descarga iniciada",
          description: `${doc.nombre_documento}${doc.ext_documento || ''} se está descargando`,
          color: "success"
        });
      } else {
        throw new Error(result.error || "Error desconocido al descargar el documento");
      }
      
      setDownloadingId(null);
    } catch (error: any) {
      console.error("Error en la descarga:", error);
      
      // Mensaje de error desde el servicio o uno genérico
      const errorMessage = error.message || "No se pudo descargar el documento";
      
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
              <p key="document-type-label" className="text-sm text-gray-500 mb-2">Tipo de documento</p>
              <div className="flex flex-wrap gap-2">
                <Chip 
                  key="docx-chip"
                  variant={selectedType === 'Docx' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('Docx')}
                >
                  Docx
                </Chip>

                <Chip 
                  key="tutela-chip"
                  variant={selectedType === 'Tutela' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('Tutela')}
                >
                  Tutela
                </Chip>
                <Chip 
                  key="radicado-chip"
                  variant={selectedType === 'Radicado' ? "solid" : "flat"}
                  color="primary" 
                  className="cursor-pointer"
                  onClick={() => setSelectedType('Radicado')}
                >
                  Radicado
                </Chip>
                <Chip 
                  key="otro-chip"
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
              <p key="error-message">Error al cargar los documentos</p>
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
              <p key="no-docs-message" className="text-center text-gray-600">
                No hay documentos de tipo <span className="font-semibold">{selectedType}</span>
              </p>
              <p key="select-other-type" className="text-sm text-gray-500 text-center">
                Puedes seleccionar otro tipo de documento usando los botones de arriba
              </p>
            </div>
          ) : (
            <div key="filtered-documents-list" className="flex flex-col gap-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id_documento} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div key={`content-${doc.id_documento}`} className="flex items-start gap-3">
                    <DocumentTextIcon key={`icon-${doc.id_documento}`} className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div key={`info-${doc.id_documento}`}>
                      <p key={`title-${doc.id_documento}`} className="font-medium">{doc.nombre_documento}{doc.ext_documento || ''}</p>
                      <p key={`date-${doc.id_documento}`} className="text-sm text-gray-500">
                        Subido el {parseDateToLocal(doc.created_date || doc.fecha_asigna)}
                      </p>
                      <p key={`user-${doc.id_documento}`} className="text-sm text-gray-500">
                        {doc.subido_por && ` por ${userNames[doc.subido_por] || "Usuario..."}`}
                      </p>
                      <div key={`chips-${doc.id_documento}`} className="flex flex-wrap gap-1 mt-1">
                        <Chip
                          key={`ext-${doc.id_documento}`}
                          size="sm"
                          variant="flat"
                          color={(doc.ext_documento && doc.ext_documento === '.pdf') ? 'danger' : 'primary'}
                        >
                          {doc.ext_documento ? doc.ext_documento.substring(1).toUpperCase() : 'DESCONOCIDO'}
                        </Chip>
                        {doc.tipo_documento && (
                          <Chip
                            key={`tipo-${doc.id_documento}`}
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
                    key={`download-btn-${doc.id_documento}`}
                    color="primary"
                    isLoading={downloadingId === doc.id_documento}
                    spinner={<Spinner size="sm" color="white" />}
                    onPress={() => handleDownload(doc)}
                    startContent={<ArrowDownTrayIcon key={`download-icon-${doc.id_documento}`} className="w-5 h-5" />}
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