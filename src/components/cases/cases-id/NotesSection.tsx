"use client";

import {
  Button,
  Textarea,
  Spinner,
  addToast,
  Avatar,
  Divider,
  Tooltip,
} from "@heroui/react";
import {
  PaperAirplaneIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { createNote } from "@/services/noteService";
import { Nota } from "@/types/cases";
import { parseDateToLocal } from "@/utils/date";
import { useAuth } from "@/hooks/useAuth";
import { getUserIdFromFirebase } from "@/services/userService";
import { useInternalUserId } from "@/hooks/useInternalUserId";
import { logger } from "@/utils/logUtils";

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
  const { user } = useAuth();
  const {
    internalUserId,
    isLoading: isLoadingUserId,
    error: userIdError,
  } = useInternalUserId();

  const [noteText, setNoteText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Nota[]>(initialNotes || []);
  const [error, setError] = useState<string | null>(null);

  // Log user details for debugging
  useEffect(() => {
    if (user) {
      console.log(`Usuario Firebase actual: ${user.uid}, Email: ${user.email}`);
    } else {
      console.warn("No hay usuario autenticado");
    }

    if (internalUserId) {
      console.log(`ID interno del usuario: ${internalUserId}`);
    }

    if (userIdError) {
      console.error(`Error al obtener ID interno: ${userIdError}`);
    }
  }, [user, internalUserId, userIdError]);

  // Log initial notes
  useEffect(() => {
    if (initialNotes) {
      console.log(`Notas iniciales cargadas: ${initialNotes.length}`);
      // Ordenar notas por fecha (más recientes primero)
      const sortedNotes = [...initialNotes].sort((a, b) => 
        new Date(b.fecha_crea).getTime() - new Date(a.fecha_crea).getTime()
      );
      setNotes(sortedNotes);
    } else {
      console.log("No hay notas iniciales disponibles");
    }
  }, [initialNotes]);

  const handleAddNote = async () => {
    // Validar que haya texto en la nota
    if (!noteText.trim()) return;

    // Verificar que tenemos el ID de usuario interno
    if (!internalUserId) {
      const errorMsg = "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.";
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
      logger.info(`[NotesSection] Enviando nota: caso=${caseId}, usuario=${internalUserId}, mensaje=${noteText.substring(0, 20)}...`);
      
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

  // Get user initials for avatar
  const getUserInitials = (user: any): string => {
    if (!user) return "?";

    const firstName = user.primer_nombre || "";
    const lastName = user.primer_apellido || "";

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Handle keyboard submit with Ctrl+Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && noteText.trim()) {
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
          <div className="border rounded-lg mb-4">
            <Textarea
              minRows={3}
              placeholder="Escribe tu nota... (Ctrl+Enter para enviar)"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus:ring-0 rounded-t-lg"
            />
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-b-lg">
              <span className="text-xs text-gray-500 ml-2">
                {error ? (
                  <span className="text-danger flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {error}
                  </span>
                ) : (
                  "Ctrl+Enter para enviar rápido"
                )}
              </span>
              <Button
                color="primary"
                isDisabled={!noteText.trim() || isLoading || !internalUserId}
                isLoading={isLoading}
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
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div
                    key={note.id_nota}
                    className="bg-gray-50 rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={getUserInitials(note.usuario)}
                        color="primary"
                        size="sm"
                        isBordered
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-sm">
                            {note.usuario
                              ? `${note.usuario.primer_nombre} ${note.usuario.primer_apellido}`
                              : `Usuario ${
                                  note.id_usuario ||
                                  note.id_usuario_crea ||
                                  "desconocido"
                                }`}
                          </p>
                          <div className="flex items-center text-gray-500 text-xs">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            <span>{parseDateToLocal(note.fecha_crea)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {note.mensaje}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
