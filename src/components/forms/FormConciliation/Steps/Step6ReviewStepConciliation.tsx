type ReviewStepProps = {
  formData: {
    primer_nombre: string;
    segundo_nombre: string;
    email: string;
    num_movil: string;
  };
  updateFormData?: (data: Partial<ReviewStepProps["formData"]>) => void;
};

export default function Step6ReviewStepConciliation({ formData }: ReviewStepProps) {
  return (
    <div className="space-y-8">
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">
        Información del Ciudadano
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Tipo de documento</p>
          <p>{formData.primer_nombre}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Número de documento</p>
          <p>{formData.segundo_nombre}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Correo electrónico</p>
          <p>{formData.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Número de móvil</p>
          <p>{formData.num_movil}</p>
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
