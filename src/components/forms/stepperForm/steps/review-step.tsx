type ReviewStepProps = {
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
    notas: string;
    rol: string;
    profesor_id: string;
    monitor_id: string;
    alumno_id: string;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
};

export default function ReviewStep({ formData }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium">Información personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tipo de documento:</span>
              <p>{formData.tipo_documento}</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Número de documento:
              </span>
              <p>{formData.num_documento}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Primer nombre:</span>
              <p>{formData.primer_nombre}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Segundo nombre:</span>
              <p>{formData.segundo_nombre}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Primer apellido:</span>
              <p>{formData.primer_apellido}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Segundo apellido:</span>
              <p>{formData.segundo_apellido}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sexo:</span>
              <p>{formData.sexo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Genero:</span>
              <p>{formData.genero}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Orientación sexual:</span>
              <p>{formData.orient_sexual}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Número de teléfono:</span>
              <p>{formData.num_movil}</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Número de teléfono fijo:
              </span>
              <p>{formData.num_fijo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p>{formData.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Nacionalidad:</span>
              <p>{formData.nacionalidad}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Estado civil:</span>
              <p>{formData.estado_civil}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Escolaridad:</span>
              <p>{formData.escolaridad}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Etnia:</span>
              <p>{formData.etnia}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Discapacidad:</span>
              <p>{formData.discapacidad}</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Sabe leer y escribir:
              </span>
              <p>{formData.sabe_leer_escribir}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Notas:</span>
              <p>{formData.notas}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Información administrativa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Profesor:</span>
              <p>{formData.profesor_id || "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Monitor:</span>
              <p>{formData.monitor_id || "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Alumno:</span>
              <p>{formData.alumno_id || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-4">
        <p className="text-sm">
          By submitting this form, you agree to our Terms of Service and Privacy
          Policy. Please ensure all information is correct before proceeding.
        </p>
      </div>
    </div>
  );
}
