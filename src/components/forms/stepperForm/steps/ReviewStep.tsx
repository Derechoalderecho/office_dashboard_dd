type ReviewStepProps = {
  formData: {
    // Citizen information
    num_documento: string;
    tipo_documento: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    sexo: string;
    genero: string;
    orient_sexual: string;
    //fecha_nacimiento: "",
    num_movil: string;
    num_fijo: string;
    email: string;
    nacionalidad: string;
    estado_civil: string;
    escolaridad: string;
    etnia: string;
    discapacidad: string;
    sabe_leer_escribir: string;
    
    // Case information
    notas: string;
    tipo_proceso: string;
    estado: string;
    tiempo_respuesta: string;
    
    // Administration information
    persona_modifica: string;
    profesor_id: string;
    monitor_id: string;
    alumno_id: string;
    
    // Citizen selection tracking
    citizen_id: string;
    is_existing_citizen: string;
  };
  updateFormData?: (data: Partial<ReviewStepProps["formData"]>) => void;
};

export default function ReviewStep({ formData }: ReviewStepProps) {
  const isExistingCitizen = formData.is_existing_citizen === "true";
  
  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          Información del Ciudadano 
          {isExistingCitizen && <span className="text-sm text-green-600 ml-2">(Ciudadano existente)</span>}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Tipo de documento</p>
            <p>{formData.tipo_documento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Número de documento</p>
            <p>{formData.num_documento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nombre completo</p>
            <p>{`${formData.primer_nombre} ${formData.segundo_nombre || ''} ${formData.primer_apellido} ${formData.segundo_apellido || ''}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Correo electrónico</p>
            <p>{formData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono móvil</p>
            <p>{formData.num_movil}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono fijo</p>
            <p>{formData.num_fijo}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Información del Caso</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Tipo de proceso</p>
            <p>{formData.tipo_proceso}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <p>{formData.estado}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tiempo de respuesta (horas)</p>
            <p>{formData.tiempo_respuesta}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Usuario encargado</p>
            <p>{formData.persona_modifica}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Notas</p>
          <p className="whitespace-pre-wrap">{formData.notas}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Información Adicional (Solo Referencia)</h3>
        <p className="text-sm text-gray-500 mb-4">Esta información se guarda solo para referencia y no se realiza ninguna asignación automática en el sistema.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Profesor de referencia</p>
            <p>{formData.profesor_id || "No especificado"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monitor de referencia</p>
            <p>{formData.monitor_id || "No especificado"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Alumno de referencia</p>
            <p>{formData.alumno_id || "No especificado"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-4">
        <p className="text-sm">
          Al enviar este formulario, aceptas todos los datos que has ingresado.
          Por favor, asegúrate de que toda la información sea correcta antes de
          continuar.
          <br />
          <br />
          Si tienes alguna duda, por favor contacta al administrador del
          sistema.
        </p>
      </div>
    </div>
  );
}
