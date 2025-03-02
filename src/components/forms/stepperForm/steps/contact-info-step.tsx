import { Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useState } from "react";

type ContactInfoProps = {
  formData: {
    notas: string;
  };
  updateFormData: (
    data: Partial<{
      notas: string;
    }>
  ) => void;
};

export default function ContactInfoStep({
  formData,
  updateFormData,
}: ContactInfoProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Textarea
          id="notas"
          name="notas"
          variant="bordered"
          label="Notas"
          labelPlacement="outside"
          size="lg"

          value={formData.notas}
          onChange={(e) => updateFormData({ notas: e.target.value })}
          placeholder="Ingrese las notas"
          required
        />
      </div>
    </div>
  );
}
