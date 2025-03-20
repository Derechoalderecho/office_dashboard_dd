"use client";

import { Button, Textarea } from "@heroui/react";
import { LinkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function NotesSection() {
  const [noteText, setNoteText] = useState("");

  const handleAddNote = () => {
    // Implementation for adding a note would go here
    console.log("Adding note:", noteText);
    // Reset text after adding
    setNoteText("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">Notas</p>
        <Button
          startContent={<LinkIcon className="w-[18px] text-primary" />}
          variant="light"
          className="text-primary"
          onPress={handleAddNote}
          isDisabled={!noteText.trim()}
        >
          Añadir nota
        </Button>
      </div>
      <Textarea
        minRows={6}
        variant="bordered"
        placeholder="Escribe tu nota y presiona añadir nota para guardarla"
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
      />
    </div>
  );
} 