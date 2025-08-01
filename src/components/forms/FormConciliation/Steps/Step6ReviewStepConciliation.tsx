import { useFormContext } from "react-hook-form";
import { Chip } from "@heroui/react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function Step6ReviewStepConciliation() {
  const { watch } = useFormContext();
  const formValues = watch();

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No especificada";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const InfoField = ({ label, value, className = "" }: { label: string; value: any; className?: string }) => (
    <div className={`space-y-1 ${className}`}>
      <p className="text-gray-500">{label}</p>
      <p className="text-gray-900">{value || "No especificado"}</p>
    </div>
  );

  return (
    <section className="space-y-5 mx-auto">
      {/* Información del Solicitante */}
      <section className="space-y-8 border border-gray-300 p-3 rounded-xl">
        <h6 className="text-lg font-semibold">Información del ciudadano solicitante</h6>
        <div className="grid grid-cols-2 gap-8">
            <InfoField label="Tipo de Documento" value={formValues.ciudadano_solicitante?.tipo_documento} />
            <InfoField label="Número de Documento" value={formValues.ciudadano_solicitante?.num_documento} />
            <InfoField label="Primer Nombre" value={formValues.ciudadano_solicitante?.primer_nombre} />
            <InfoField label="Segundo Nombre" value={formValues.ciudadano_solicitante?.segundo_nombre} />
            <InfoField label="Primer Apellido" value={formValues.ciudadano_solicitante?.primer_apellido} />
            <InfoField label="Segundo Apellido" value={formValues.ciudadano_solicitante?.segundo_apellido} />
            <InfoField label="Fecha de Nacimiento" value={formatDate(formValues.ciudadano_solicitante?.fecha_nacimiento)} />
            <InfoField label="Sexo" value={formValues.ciudadano_solicitante?.sexo} />
            <InfoField label="Género" value={formValues.ciudadano_solicitante?.genero} />
            <InfoField label="Teléfono Móvil" value={formValues.ciudadano_solicitante?.num_movil} />
            <InfoField label="Teléfono Fijo" value={formValues.ciudadano_solicitante?.telefono_fijo} />
            <InfoField label="Email" value={formValues.ciudadano_solicitante?.email} />
            <InfoField label="Nacionalidad" value={formValues.ciudadano_solicitante?.nacionalidad} />
            <InfoField label="Estado Civil" value={formValues.ciudadano_solicitante?.estado_civil} />
            <InfoField label="Escolaridad" value={formValues.ciudadano_solicitante?.escolaridad} />
            <InfoField label="Ocupación" value={formValues.ciudadano_solicitante?.ocupacion} />
            <InfoField label="Departamento" value={formValues.ciudadano_solicitante?.departamento} />
            <InfoField label="Municipio" value={formValues.ciudadano_solicitante?.municipio} />
            <InfoField label="Dirección" value={formValues.ciudadano_solicitante?.direccion_residencia} />
          </div>
      </section>

      {/* Información de Contrapartes */}
      <section className="space-y-8 border border-gray-300 p-3 rounded-xl">
        <h6 className="text-lg font-semibold">Contrapartes del Caso</h6>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-8">
            <InfoField label="Tipo de Proceso" value={formValues.tipo_proceso} />
            <InfoField label="Materia del Caso" value={formValues.materia_del_caso} />
          </div>
          
          {formValues.ciudadano_citado && formValues.ciudadano_citado.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Ciudadanos Citados:</h4>
              {formValues.ciudadano_citado.map((citado: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-8">
                    <InfoField label="Tipo de Documento" value={citado.tipo_documento} />
                    <InfoField label="Número de Documento" value={citado.num_documento} />
                    <InfoField label="Nombres" value={`${citado.primer_nombre} ${citado.segundo_nombre || ''}`.trim()} />
                    <InfoField label="Apellidos" value={`${citado.primer_apellido} ${citado.segundo_apellido || ''}`.trim()} />
                    <InfoField label="Teléfono" value={citado.telefono_movil} />
                    <InfoField label="Email" value={citado.email} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {Boolean(formValues.existen_persona_beneficiaria) === true && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Personas Beneficiarias:</h4>
              {formValues.ciudadano_beneficiado && formValues.ciudadano_beneficiado.length > 0 ? (
                formValues.ciudadano_beneficiado.map((beneficiario: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="grid grid-cols-2 gap-8">
                      <InfoField label="Tipo de Documento" value={beneficiario.tipo_documento} />
                      <InfoField label="Número de Documento" value={beneficiario.num_documento} />
                      <InfoField label="Nombres" value={`${beneficiario.primer_nombre} ${beneficiario.segundo_nombre || ''}`.trim()} />
                      <InfoField label="Apellidos" value={`${beneficiario.primer_apellido} ${beneficiario.segundo_apellido || ''}`.trim()} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-500">No se han registrado personas beneficiarias</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Información del Caso */}
      <section className="space-y-8 border border-gray-300 p-3 rounded-xl">
        <h6 className="text-lg font-semibold">Información del Caso</h6>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-8">
            <InfoField label="Inicio del Conflicto" value={formValues.inicio_de_conflicto} />
            <InfoField label="Escala del Conflicto" value={formValues.escala_del_conflicto} />
            <InfoField label="Última Intervención" value={formValues.ultima_intervencion} />
            <InfoField label="Fecha de Intervención" value={formatDate(formValues.fecha_intervencion)} />
            <InfoField label="Modalidad de Audiencia" value={formValues.modalidad_audiencia} />
          </div>
          
          <div className="space-y-4">
            <InfoField label="Hechos" value={formValues.hechos} />
            <InfoField label="Pretensiones" value={formValues.pretensiones} />
            <InfoField label="Cuantía" value={formValues.cuantia} />
            <InfoField label="Fundamentos de Derecho" value={formValues.fundamentos_derecho} />
            <InfoField label="Pruebas del Solicitante" value={formValues.prueas_solicitante} />
            <InfoField label="Pruebas del Citado" value={formValues.pruebas_citado} />
          </div>
        </div>
      </section>

      {/* Anexos y Documentos */}
      <section className="space-y-8 border border-gray-300 p-3 rounded-xl">
        <h6 className="text-lg font-semibold">Anexos y Documentos</h6>
        <div className="space-y-4">
          {/* Anexos Obligatorios */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Anexos Obligatorios:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                  <span className="text-sm">Registro Civil del Menor</span>
                  {formValues.anexo_registro_civil && <Chip size="sm" className="text-white" color="success">Subido</Chip>}
                </div>
                {formValues.anexo_registro_civil && (
                  <span className="text-xs text-gray-500">
                    {formValues.anexo_registro_civil.name} ({formatFileSize(formValues.anexo_registro_civil.size)})
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                  <span className="text-sm">Cédula del Solicitante</span>
                  {formValues.anexo_cedula_solicitante && <Chip size="sm" className="text-white" color="success">Subido</Chip>}
                </div>
                {formValues.anexo_cedula_solicitante && (
                  <span className="text-xs text-gray-500">
                    {formValues.anexo_cedula_solicitante.name} ({formatFileSize(formValues.anexo_cedula_solicitante.size)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Anexos Adicionales */}
          {formValues.anexos_adicionales && formValues.anexos_adicionales.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Anexos Adicionales ({formValues.anexos_adicionales.length}):</h4>
              <div className="space-y-2">
                {formValues.anexos_adicionales.map((file: File, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-6 w-6 text-green-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Firma Digital y Foto */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Documentos de Verificación:</h4>
            <div className="flex flex-col gap-8">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Firma Digital</span>
                  {formValues.firma_digital && <Chip size="sm" className="text-white" color="success">Subido</Chip>}
                </div>
                {formValues.firma_digital && (
                  <span className="text-xs text-gray-500">
                    Firma registrada correctamente
                  </span>
                )}
              </div>
              
              {
                formValues.foto_usuario && (
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-medium">Foto del Usuario</span>
                      {formValues.foto_usuario && <Chip size="sm" color="success">Subido</Chip>}
                    </div>
                    {formValues.foto_usuario && (
                      <span className="text-xs text-gray-500">
                        Foto registrada correctamente
                      </span>
                    )}
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </section>

      {/* Programación de Audiencia */}
      {formValues.fechas_audiencia && formValues.fechas_audiencia.length > 0 && (
        <section className="space-y-8 border border-gray-300 p-3 rounded-xl">
          <h6 className="text-lg font-semibold">Programación de Audiencia</h6>
          <div className="space-y-2">
            {formValues.fechas_audiencia.map((opcion: any, index: number) => {
              // Extraer la fecha y hora directamente del string ISO
              const [fechaParte, horaParte] = opcion.fecha_hora.split('T');
              
              // Formatear la fecha (YYYY-MM-DD a DD/MM/YYYY)
              const [año, mes, dia] = fechaParte.split('-');
              const fechaFormateada = `${dia}/${mes}/${año}`;
              
              // Formatear la hora (extraer HH:MM de HH:MM:00)
              const horaFormateada = horaParte.substring(0, 5);
              
              return (
                <div key={index} className="p-3 border border-gray-200 rounded-lg bg-blue-50">
                  <span className="text-sm font-medium">Opción {index + 1}: </span>
                  <span className="text-sm">{fechaFormateada} a las {horaFormateada}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Confirmaciones */}
      <section className="space-y-8 border border-gray-300 p-3 rounded-xl">
        <h6 className="text-lg font-semibold">Confirmaciones</h6>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Chip size="sm" className="text-white" color={formValues.confirma_datos ? "success" : "danger"}>
              {formValues.confirma_datos ? "Confirmado" : "Pendiente"}
            </Chip>
            <span className="text-sm">Confirmación de datos personales</span>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" className="text-white" color={formValues.confirma_tratamiento_datos ? "success" : "danger"}>
              {formValues.confirma_tratamiento_datos ? "Confirmado" : "Pendiente"}
            </Chip>
            <span className="text-sm">Autorización de tratamiento de datos</span>
          </div>
        </div>
      </section>

      {/* Mensaje final */}
      <section className="space-y-8 border border-gray-300 p-3 rounded-xl bg-blue-50">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-blue-800">
            Al enviar este formulario, confirma que toda la información proporcionada es veraz y completa.
          </p>
          <p className="text-xs text-blue-600">
            Si necesita realizar algún cambio, puede regresar a los pasos anteriores usando los botones de navegación.
          </p>
        </div>
      </section>
    </section>
  );
}
