"use client";

import { Button, Textarea, Spinner, addToast, Avatar } from "@heroui/react";
import {
  PaperAirplaneIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { createNote } from "@/services/noteService";
import { Nota } from "@/types/notas";
import { parseDate, parseTime } from "@/utils/date";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logUtils";
import { fetchUserDetails } from "@/services/userService";
import { Users } from "@/types/users";

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
        `[NotesSection] Enviando nota: caso=${caseId}, usuario=${internalUserId}, mensaje=${noteText.substring(
          0,
          20
        )}...`
      );

      // Llamar al servicio para crear la nota
      const newNote = await createNote(caseId, noteText.trim(), internalUserId);

      if (newNote) {
        logger.info(`[NotesSection] Nota creada exitosamente`);

        // Actualizar la lista de notas en la interfaz (la nueva nota al principio)
        setNotes([newNote, ...notes]);
        setNoteText("");

        // Mostrar mensaje de éxito
        addToast({
          title: "Nota agregada",
          description: "La nota ha sido agregada correctamente",
          color: "success",
        });

        // Notificar al componente padre que se ha añadido una nota
        if (onNoteAdded) {
          logger.debug(`[NotesSection] Ejecutando callback onNoteAdded`);
          onNoteAdded();
        }
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    } catch (error: any) {
      logger.error(`[NotesSection] Error al agregar nota: ${error.message}`);

      // Preparar mensaje de error para mostrar al usuario
      let errorMessage = "No se pudo agregar la nota";
      if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      addToast({
        title: "Error",
        description: errorMessage,
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
                ) : (
                  <Button
                    variant="light"
                    startContent={
                      <PaperClipIcon className="w-4 h-4 text-gray-500" />
                    }
                    size="sm"
                    className="text-gray-500"
                  >
                    Adjuntar archivo
                  </Button>
                )}
              </span>
              <Button
                color="primary"
                isDisabled={!noteText.trim() || isLoading || !internalUserId}
                isLoading={isLoading || !internalUserId}
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
