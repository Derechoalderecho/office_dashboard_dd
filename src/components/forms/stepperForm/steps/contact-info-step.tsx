import { Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useState } from "react";

type ContactInfoProps = {
  formData: {
    hechos: string;
  };
  updateFormData: (
    data: Partial<{
      hechos: string;
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
          id="hechos"
          name="hechos"
          variant="bordered"
          label="Hechos"
          labelPlacement="outside"
          value={formData.hechos}
          onChange={(e) => updateFormData({ hechos: e.target.value })}
          placeholder="Ingrese los hechos"
          required
        />
      </div>
    </div>
  );
}
