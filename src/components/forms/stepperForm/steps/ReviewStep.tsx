import { useEffect, useState } from "react";
import { fetchUserDetails } from "@/services/userService";
import { Users } from "@/types/users";

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
    fecha_nacimiento: string;
    num_movil: string;
    num_fijo: string;
    email: string;
    nacionalidad: string;
    estado_civil: string;
    escolaridad: string;
    etnia: string;
    discapacidad: string;
    sabe_leer_escribir: string;
    direccion: string;
    estrato: string;
    zona: string;
    departamento: string;
    municipio: string;
    // Case information
    notas: string;
    tipo_proceso: string;
    tiempo_respuesta: string;
    hechos: string;
    pretensiones: string;
    fundamentos: string;
    entidad: string;

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
  const [userNames, setUserNames] = useState<{
    profesor: string;
    monitor: string;
    alumno: string;
  }>({
    profesor: "Cargando...",
    monitor: "Cargando...",
    alumno: "Cargando...",
  });

  // Fetch user details to get names
  useEffect(() => {
    const loadUserNames = async () => {
      try {
        // Fetch professor name
        if (formData.profesor_id) {
          const profesor = await fetchUserDetails(formData.profesor_id);
          if (profesor) {
            setUserNames(prev => ({
              ...prev,
              profesor: `${profesor.primer_nombre} ${profesor.primer_apellido}`
            }));
          } else {
            setUserNames(prev => ({ ...prev, profesor: "No encontrado" }));
          }
        } else {
          setUserNames(prev => ({ ...prev, profesor: "No asignado" }));
        }

        // Fetch monitor name
        if (formData.monitor_id) {
          const monitor = await fetchUserDetails(formData.monitor_id);
          if (monitor) {
            setUserNames(prev => ({
              ...prev,
              monitor: `${monitor.primer_nombre} ${monitor.primer_apellido}`
            }));
          } else {
            setUserNames(prev => ({ ...prev, monitor: "No encontrado" }));
          }
        } else {
          setUserNames(prev => ({ ...prev, monitor: "No asignado" }));
        }

        // Fetch student name
        if (formData.alumno_id) {
          const alumno = await fetchUserDetails(formData.alumno_id);
          if (alumno) {
            setUserNames(prev => ({
              ...prev,
              alumno: `${alumno.primer_nombre} ${alumno.primer_apellido}`
            }));
          } else {
            setUserNames(prev => ({ ...prev, alumno: "No encontrado" }));
          }
        } else {
          setUserNames(prev => ({ ...prev, alumno: "No asignado" }));
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    loadUserNames();
  }, [formData.profesor_id, formData.monitor_id, formData.alumno_id]);

  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          Información del Ciudadano
          {isExistingCitizen && (
            <span className="text-sm text-green-600 ml-2">
              (Ciudadano existente)
            </span>
          )}
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
            <p>{`${formData.primer_nombre} ${formData.segundo_nombre || ""} ${
              formData.primer_apellido
            } ${formData.segundo_apellido || ""}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Correo electrónico</p>
            <p>{formData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono móvil</p>
            <p>{formData.num_movil ? formData.num_movil : "No especificado"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono fijo</p>
            <p>{formData.num_fijo ? formData.num_fijo : "No especificado"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dirección de residencia</p>
            <p>{formData.direccion || "No especificada"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estrato</p>
            <p>{formData.estrato}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Zona</p>
            <p>{formData.zona}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Departamento</p>
            <p>{formData.departamento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Municipio</p>
            <p>{formData.municipio}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de nacimiento</p>
            <p>{formData.fecha_nacimiento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sexo</p>
            <p>{formData.sexo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Genero</p>
            <p>{formData.genero}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Orientación sexual</p>
            <p>{formData.orient_sexual}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Discapacidad</p>
            <p>{formData.discapacidad}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sabe leer y escribir</p>
            <p>{formData.sabe_leer_escribir}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nacionalidad</p>
            <p>{formData.nacionalidad}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado civil</p>
            <p>{formData.estado_civil}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Escolaridad</p>
            <p>{formData.escolaridad}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Etnia</p>
            <p>{formData.etnia}</p>
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
            <p>Viabilidad</p>
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
        
        {formData.hechos && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Hechos</p>
            <p className="whitespace-pre-wrap">{formData.hechos}</p>
          </div>
        )}
        
        {formData.pretensiones && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Pretensiones</p>
            <p className="whitespace-pre-wrap">{formData.pretensiones}</p>
          </div>
        )}
        
        {formData.fundamentos && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Fundamentos de derecho</p>
            <p className="whitespace-pre-wrap">{formData.fundamentos}</p>
          </div>
        )}
        
        {formData.entidad && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Entidad</p>
            <p className="whitespace-pre-wrap">{formData.entidad}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-500">Notas</p>
          <p className="whitespace-pre-wrap">{formData.notas}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          Información Adicional (Solo Referencia)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Esta información se guarda solo para referencia y no se realiza
          ninguna asignación automática en el sistema.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Profesor de referencia</p>
            <p>{userNames.profesor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monitor de referencia</p>
            <p>{userNames.monitor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Alumno de referencia</p>
            <p>{userNames.alumno}</p>
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
