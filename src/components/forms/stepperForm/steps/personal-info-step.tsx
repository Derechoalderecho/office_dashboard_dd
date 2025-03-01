"use client";

import { Input, Select, SelectItem, DateInput, DateValue } from "@heroui/react";
import { useState } from "react";
type PersonalInfoProps = {
  formData: {
    num_documento: string;
    tipo_documento: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    sexo: string;
    genero: string;
    orient_sexual: string;
    fecha_nacimiento: Date;
    num_movil: string;
    num_fijo: string;
    email: string;
    nacionalidad: string;
    estado_civil: string;
    escolaridad: string;
    etnia: string;
    discapacidad: string;
    sabe_leer_escribir: string;
  };
  updateFormData: (
    data: Partial<{
      num_documento: string;
      tipo_documento: string;
      primer_nombre: string;
      segundo_nombre: string;
      primer_apellido: string;
      segundo_apellido: string;
      sexo: string;
      genero: string;
      orient_sexual: string;
      //fecha_nacimiento: Date;
      num_movil: string;
      num_fijo: string;
      email: string;
      nacionalidad: string;
      estado_civil: string;
      escolaridad: string;
      etnia: string;
      discapacidad: string;
      sabe_leer_escribir: string;
    }>
  ) => void;
};

export default function PersonalInfoStep({
  formData,
  updateFormData,
}: PersonalInfoProps) {
  const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(
    null
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          id="tipo_documento"
          name="tipo_documento"
          variant="bordered"
          label="Tipo de documento"
          labelPlacement="outside"
          value={formData.tipo_documento}
          onChange={(e) => updateFormData({ tipo_documento: e.target.value })}
        >
          <SelectItem key="CC">Cédula de ciudadanía</SelectItem>
          <SelectItem key="TI">Tarjeta de identidad</SelectItem>
          <SelectItem key="CE">Cédula de extranjería</SelectItem>
        </Select>

        <Input
          id="num_documento"
          name="num_documento"
          variant="bordered"
          label="Número de documento"
          labelPlacement="outside"
          value={formData.num_documento}
          onChange={(e) => updateFormData({ num_documento: e.target.value })}
          placeholder="Ingrese su número de documento"
          required
        />

        <Input
          id="primer_nombre"
          name="primer_nombre"
          variant="bordered"
          label="Primer nombre"
          labelPlacement="outside"
          value={formData.primer_nombre}
          onChange={(e) => updateFormData({ primer_nombre: e.target.value })}
          placeholder="Ingrese su primer nombre"
          required
        />

        <Input
          id="segundo_nombre"
          name="segundo_nombre"
          variant="bordered"
          label="Segundo nombre"
          labelPlacement="outside"
          value={formData.segundo_nombre}
          onChange={(e) => updateFormData({ segundo_nombre: e.target.value })}
          placeholder="Ingrese su segundo nombre"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          id="primer_apellido"
          name="primer_apellido"
          variant="bordered"
          label="Primer apellido"
          labelPlacement="outside"
          value={formData.primer_apellido}
          onChange={(e) => updateFormData({ primer_apellido: e.target.value })}
          placeholder="Ingrese su primer apellido"
          required
        />

        <Input
          id="segundo_apellido"
          name="segundo_apellido"
          variant="bordered"
          label="Segundo apellido"
          labelPlacement="outside"
          value={formData.segundo_apellido}
          onChange={(e) => updateFormData({ segundo_apellido: e.target.value })}
          placeholder="Ingrese su segundo apellido"
          required
        />

        <Select
          id="sexo"
          name="sexo"
          variant="bordered"
          label="Sexo"
          labelPlacement="outside"
          value={formData.sexo}
          onChange={(e) => updateFormData({ sexo: e.target.value })}
        >
          <SelectItem key="M">Masculino</SelectItem>
          <SelectItem key="F">Femenino</SelectItem>
          <SelectItem key="I">Intersexual</SelectItem>
          <SelectItem key="N">Prefiero no decirlo</SelectItem>
        </Select>

        <Select
          id="genero"
          name="genero"
          variant="bordered"
          label="Género"
          labelPlacement="outside"
          value={formData.genero}
          onChange={(e) => updateFormData({ genero: e.target.value })}
        >
          <SelectItem key="M">Hombre</SelectItem>
          <SelectItem key="F">Femenino</SelectItem>
          <SelectItem key="N">Prefiero no decirlo</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          id="orient_sexual"
          name="orient_sexual"
          variant="bordered"
          label="Orientación sexual"
          labelPlacement="outside"
          value={formData.orient_sexual}
          onChange={(e) => updateFormData({ orient_sexual: e.target.value })}
        >
          <SelectItem key="H">Heterosexual</SelectItem>
          <SelectItem key="B">Bisexual</SelectItem>
          <SelectItem key="L">Lesbiana</SelectItem>
          <SelectItem key="G">Gay</SelectItem>
          <SelectItem key="Q">Queer</SelectItem>
          <SelectItem key="A">Asexual</SelectItem>
          <SelectItem key="N">Prefiero no decirlo</SelectItem>
        </Select>

        {/* <DateInput
          id="fecha_nacimiento"
          name="fecha_nacimiento"
          variant="bordered"
          label="Fecha de nacimiento"
          labelPlacement="outside"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e)}
        /> */}

        <Input
          id="num_movil"
          name="num_movil"
          variant="bordered"
          label="Número de teléfono móvil"
          labelPlacement="outside"
          type="number"
          value={formData.num_movil}
          onChange={(e) => updateFormData({ num_movil: e.target.value })}
          placeholder="Ingrese su número de teléfono móvil"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="num_fijo"
          name="num_fijo"
          variant="bordered"
          label="Número de teléfono fijo"
          labelPlacement="outside"
          value={formData.num_fijo}
          onChange={(e) => updateFormData({ num_fijo: e.target.value })}
          placeholder="Ingrese su número de teléfono fijo"
          required
        />

        <Input
          id="email"
          name="email"
          variant="bordered"
          label="Correo electrónico"
          labelPlacement="outside"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          placeholder="Ingrese su correo electrónico"
          required
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select
          id="nacionalidad"
          name="nacionalidad"
          variant="bordered"
          label="Nacionalidad"
          labelPlacement="outside"
          value={formData.nacionalidad}
          onChange={(e) => updateFormData({ nacionalidad: e.target.value })}
        >
          <SelectItem key="Colombia">Colombia</SelectItem>
          <SelectItem key="Venezuela">Venezuela</SelectItem>
          <SelectItem key="Ecuador">Ecuador</SelectItem>
        </Select>

        <Select
          id="estado_civil"
          name="estado_civil"
          variant="bordered"
          label="Estado civil"
          labelPlacement="outside"
          value={formData.estado_civil}
          onChange={(e) => updateFormData({ estado_civil: e.target.value })}
        >
          <SelectItem key="Soltero">Soltero</SelectItem>
          <SelectItem key="Casado">Casado</SelectItem>
          <SelectItem key="Divorciado">Divorciado</SelectItem>
          <SelectItem key="Viudo">Viudo</SelectItem>
          <SelectItem key="Unión libre">Unión libre</SelectItem>
          <SelectItem key="Unión civil">Unión civil</SelectItem>
        </Select>

        <Select
          id="escolaridad"
          name="escolaridad"
          variant="bordered"
          label="Escolaridad"
          labelPlacement="outside"
          value={formData.escolaridad}
          onChange={(e) => updateFormData({ escolaridad: e.target.value })}
        >
          <SelectItem key="Primaria">Primaria</SelectItem>
          <SelectItem key="Secundaria">Secundaria</SelectItem>
          <SelectItem key="Universidad">Universidad</SelectItem>
        </Select>

        <Select
          id="etnia"
          name="etnia"
          variant="bordered"
          label="Etnia"
          labelPlacement="outside"
          value={formData.etnia}
          onChange={(e) => updateFormData({ etnia: e.target.value })}
        >
          <SelectItem key="Indígena">Indígena</SelectItem>
          <SelectItem key="Afrodescendiente">Afrodescendiente</SelectItem>
          <SelectItem key="Roma">Roma</SelectItem>
          <SelectItem key="Palenquero">Palenquero</SelectItem>
          <SelectItem key="Otro">Otro</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="discapacidad"
          name="discapacidad"
          variant="bordered"
          label="Discapacidad"
          labelPlacement="outside"
          value={formData.discapacidad}
          onChange={(e) => updateFormData({ discapacidad: e.target.value })}
        >
          <SelectItem key="Sí">Sí</SelectItem>
          <SelectItem key="No">No</SelectItem>
        </Select>

        <Select
          id="sabe_leer_escribir"
          name="sabe_leer_escribir"
          variant="bordered"
          label="Sabe leer y escribir"
          labelPlacement="outside"
          value={formData.sabe_leer_escribir}
          onChange={(e) =>
            updateFormData({ sabe_leer_escribir: e.target.value })
          }
        >
          <SelectItem key="Sí">Sí</SelectItem>
          <SelectItem key="No">No</SelectItem>
        </Select>
      </div>
    </div>
  );
}
