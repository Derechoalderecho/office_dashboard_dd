"use client";

import { Button, Textarea, Spinner, addToast, Avatar } from "@heroui/react";
import {
  PaperAirplaneIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PaperClipIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import { createNote } from "@/services/noteService";
import { Nota } from "@/types/notas";
import { parseDate, parseTime } from "@/utils/date";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logUtils";
import { fetchUserDetails } from "@/services/userService";
import { Users } from "@/types/users";
import { uploadDocument } from "@/services/uploadDocumentsService";
import { DocumentResponse } from "@/types/documents";

interface NotesSectionProps {
  caseId: number;
  initialNotes?: Nota[];
  onNoteAdded?: () => void;
}

export default function NotesSection({
  caseId,
  initialNotes,
  onNoteAdded,
}: NotesSectionProps) {
  const {
    internalUserId,
    loading: isLoadingUserId,
    error: userIdError,
  } = useAuth();

  const [noteText, setNoteText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Nota[]>(initialNotes || []);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<number, Users>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logs iniciales de notas y fetch de usuarios
  useEffect(() => {
    if (initialNotes) {
      console.log(`Notas iniciales cargadas: ${initialNotes.length}`);
      // Ordenar notas por fecha (más recientes primero)
      const sortedNotes = [...initialNotes].sort(
        (a, b) =>
          new Date(b.created_date).getTime() -
          new Date(a.created_date).getTime()
      );
      setNotes(sortedNotes);

      // Fetch usuarios para notas
      fetchUsersForNotes(sortedNotes);
    } else {
      console.log("No hay notas iniciales disponibles");
    }
  }, [initialNotes]);

  // Fetch usuarios para notas
  const fetchUsersForNotes = async (notesToProcess: Nota[]) => {
    if (!notesToProcess.length) return;

    setLoadingUsers(true);

    try {
      // Obtiene IDs únicos de usuarios
      const userIds = Array.from(
        new Set(notesToProcess.map((note) => note.id_usuario))
      );

      // Crea un nuevo objeto de cache
      const newUserCache: Record<number, Users> = { ...userCache };

      // Fetch de usuarios con información única de notas no en cache
      const fetchPromises = userIds
        .filter((userId) => !newUserCache[userId])
        .map(async (userId) => {
          try {
            const user = await fetchUserDetails(userId.toString());
            if (user) {
              newUserCache[userId] = user;
            }
            return user;
          } catch (error) {
            logger.error(`Error fetching user ${userId}:`, error);
            return null;
          }
        });

      await Promise.all(fetchPromises);
      setUserCache(newUserCache);
    } catch (error) {
      logger.error("Error fetching users for notes:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Obtiene nombre de usuario
  const getUserName = (userId: number): string => {
    const user = userCache[userId];
    if (user) {
      return `${user.primer_nombre} ${user.primer_apellido}`;
    }
    return `Usuario ${userId}`;
  };

  // Obtiene iniciales de usuario
  const getUserInitials = (userId: number): string => {
    const user = userCache[userId];

    if (!user) {
      return "U";
    }

    const firstName = user.primer_nombre || "";
    const lastName = user.primer_apellido || "";

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validar tamaño del archivo (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo es demasiado grande. El tamaño máximo es 10 MB.");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFileForNote = async (
    noteId: number
  ): Promise<DocumentResponse | null> => {
    if (!selectedFile || !internalUserId) return null;

    setIsUploadingFile(true);
    try {
      // Convertir internalUserId a string y mantener noteId como número
      const result = await uploadDocument(
        selectedFile,
        caseId,
        internalUserId.toString(), // Convertir a string para que coincida con el tipo esperado
        noteId // Mantener como número según la definición del servicio
      );

      if (result.success && result.data) {
        logger.info(
          `[NotesSection] Archivo subido con éxito: ${result.data.id_documento}`
        );
        return result.data;
      } else {
        throw new Error(result.error || "Error al subir el archivo");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Error desconocido al subir el archivo";
      logger.error(`[NotesSection] Error al subir archivo: ${errorMsg}`);
      throw new Error(errorMsg);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleAddNote = async () => {
    // Validar que haya texto en la nota
    if (!noteText.trim()) return;

    // Verificar que tenemos el ID de usuario interno
    if (!internalUserId) {
      const errorMsg =
        "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.";
      setError(errorMsg);
      logger.error(`[NotesSection] Error: ${errorMsg}`);
      addToast({
        title: "Error",
        description: errorMsg,
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info(
        `[NotesSection] Agregando nota al caso ${caseId} por usuario ${internalUserId}`
      );

      // Llamar al servicio para crear la nota con los parámetros correctos
      const newNote = await createNote(caseId, noteText.trim(), internalUserId);

      if (newNote) {
        logger.info(
          `[NotesSection] Nota agregada con éxito: ${newNote.id_nota_caso}`
        );

        // Si hay un archivo seleccionado, subirlo y asociarlo a la nota
        let documentData = null;
        if (selectedFile) {
          try {
            documentData = await uploadFileForNote(newNote.id_nota_caso);
            // Si el documento se subió correctamente, agregarlo a la nota
            if (documentData) {
              newNote.documentos = [documentData];
            }
          } catch (uploadError) {
            // Mostrar error de carga pero no impedir que se muestre la nota
            addToast({
              title: "Error al subir archivo",
              description:
                uploadError instanceof Error
                  ? uploadError.message
                  : "Error al subir el archivo adjunto",
              color: "warning",
            });
          }
        }

        // Agregar la nueva nota al inicio del array
        setNotes([newNote, ...notes]);

        // Limpiar el campo de texto y archivo
        setNoteText("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Notificar al componente padre si es necesario
        if (onNoteAdded) {
          onNoteAdded();
        }

        // Actualizar el cache de usuarios si es necesario
        const userId =
          typeof newNote.id_usuario === "string"
            ? parseInt(newNote.id_usuario)
            : newNote.id_usuario;

        if (!userCache[userId]) {
          fetchUsersForNotes([newNote]);
        }

        addToast({
          title: "Nota agregada",
          description: documentData
            ? "La nota y el archivo adjunto han sido agregados correctamente."
            : "La nota ha sido agregada correctamente.",
          color: "success",
        });
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      logger.error(`[NotesSection] Error: ${errorMsg}`);
      setError(errorMsg);
      addToast({
        title: "Error",
        description: "Ocurrió un error al agregar la nota.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Maneja la tecla Enter para enviar el mensaje rápido
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && noteText.trim()) {
      e.preventDefault();
      handleAddNote();
    }
  };

  // Maneja la descarga de un documento
  const handleDocumentDownload = async (doc: any) => {
    try {
      // Mostrar indicador de carga
      setIsLoading(true);

      if (!doc.id_documento_caso) {
        throw new Error("No se encontró el ID del documento para descargar");
      }

      // Usar directamente el id_documento_caso para obtener la URL firmada
      const { downloadRadicado } = await import("@/services/radicadoService");
      const result = await downloadRadicado(doc.id_documento_caso);

      if (result.success && result.signedUrl) {
        // Abrir la URL firmada en una nueva pestaña
        window.open(result.signedUrl, "_blank");

        addToast({
          title: "Descarga iniciada",
          description: "El documento se está abriendo en una nueva pestaña",
          color: "success",
        });
      } else {
        throw new Error(
          result.error || "No se pudo obtener la URL de descarga"
        );
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Error desconocido al descargar el documento";
      logger.error(`[NotesSection] Error al descargar documento: ${errorMsg}`);

      addToast({
        title: "Error",
        description: errorMsg,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">Notas</p>
      </div>

      {isLoadingUserId ? (
        <div className="flex justify-center py-5">
          <Spinner color="primary" size="sm" />
          <span className="ml-2 text-sm text-gray-500">
            Cargando usuario...
          </span>
        </div>
      ) : userIdError ? (
        <div className="text-center py-4 text-danger text-sm">
          <ExclamationCircleIcon className="w-5 h-5 mx-auto mb-2" />
          <p>{userIdError}</p>
          <p className="mt-2 text-xs">
            Por favor, inicia sesión nuevamente para continuar
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-xl mb-4">
            <Textarea
              minRows={3}
              placeholder="Escribe tu nota... (Enter para enviar)"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus:ring-0"
            />
            <div className="flex justify-between items-center pr-2 py-2 bg-gray-50 rounded-b-xl">
              <span className="text-xs text-gray-500 ml-2">
                {error ? (
                  <span className="text-danger flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {error}
                  </span>
                ) : selectedFile ? (
                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                    <DocumentIcon className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-700 max-w-[150px] truncate">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={handleRemoveFile}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="*/*"
                    />
                  </div>
                ) : (
                  <Button
                    variant="light"
                    startContent={
                      <PaperClipIcon className="w-4 h-4 text-gray-500" />
                    }
                    size="sm"
                    className="text-gray-500"
                    onPress={handleFileSelect}
                  >
                    Adjuntar archivo
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="*/*"
                    />
                  </Button>
                )}
              </span>
              <Button
                color="primary"
                isDisabled={!noteText.trim() || isLoading || !internalUserId}
                isLoading={isLoading || isUploadingFile || !internalUserId}
                spinner={<Spinner size="sm" color="white" />}
                onPress={handleAddNote}
                startContent={<PaperAirplaneIcon className="w-4 h-4" />}
                size="sm"
              >
                Agregar nota
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium mb-3">Historial de notas</h3>
              <span className="text-xs text-gray-500">
                {notes.length} notas
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No hay notas para este caso
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1 py-4">
                  {notes.map((note) => (
                    <div
                      key={note.id_nota_caso}
                      className="bg-gray-50 rounded-xl p-4 shadow-sm gap-5 flex flex-col border"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={getUserInitials(note.id_usuario)}
                            size="sm"
                            isBordered
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              {getUserName(note.id_usuario)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs">
                          <div className="flex flex-col">
                            <span>{parseDate(note.created_date)}</span>
                            <div className="flex items-center">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              <span>{parseTime(note.created_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {note.mensaje}
                        </p>
                        {note.documentos && note.documentos.length > 0 && (
                          <div className="mt-2">
                            {note.documentos.map((doc) => (
                              <div
                                key={doc.id_documento}
                                className="border rounded-lg p-3 mt-1"
                              >
                                <div
                                  className="flex items-center cursor-pointer"
                                  onClick={() => handleDocumentDownload(doc)}
                                >
                                  <DocumentIcon className="w-5 h-5 text-blue-500 mr-2" />
                                  <span className="text-sm underline text-blue-500 truncate">
                                    {doc.nombre_documento}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="ml-auto"                                    color="primary"

                                    isLoading={isLoading}
                                    isIconOnly
                                    spinner={<Spinner size="sm" />}
                                    onPress={() => handleDocumentDownload(doc)}
                                  >
                                    <ArrowDownTrayIcon className="w-4 h-4 text-blue-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
