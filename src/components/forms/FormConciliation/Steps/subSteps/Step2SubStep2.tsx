import { Button, Tab, Tabs, Switch } from "@heroui/react";
import {
  ArrowLeftIcon,
  CheckIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

// Función auxiliar para convertir un canvas a un archivo
const canvasToFile = async (
  canvas: HTMLCanvasElement,
  fileName: string
): Promise<File> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Error al convertir canvas a blob"));
          return;
        }

        // Crear un archivo a partir del blob
        const file = new File([blob], fileName, { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      0.95
    ); // Calidad 0.95 (95%)
  });
};

interface Step2SubStep2Props {
  handleBackToInfo: () => void;
}

export default function Step2SubStep2({
  handleBackToInfo,
}: Step2SubStep2Props) {
  const { setValue, watch } = useFormContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);

  // Función para redimensionar y configurar el canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    // Establecer dimensiones fijas para evitar problemas de escalado
    const width = 750;
    const height = 325;

    canvas.width = width;
    canvas.height = height;

    // Configurar el contexto después de redimensionar
    const context = canvas.getContext("2d");
    if (!context) return;

    // Configurar el contexto
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#000";
    setCtx(context);

    // Limpiar el canvas
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar la línea base para la firma
    context.beginPath();
    context.moveTo(0, canvas.height - 10);
    context.lineTo(canvas.width, canvas.height - 10);
    context.strokeStyle = "#e5e7eb";
    context.stroke();

    // Restaurar el color de trazo para la firma
    context.strokeStyle = "#000";
  };

  // Inicializar el canvas cuando el componente se monta
  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);

    return () => {
      window.removeEventListener("resize", setupCanvas);
    };
  }, []);

  // Manejar eventos de dibujo
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!ctx || !canvasRef.current) return;
    setIsDrawing(true);
    setHasSignature(true);
    setSignatureConfirmed(false); // Resetear el estado de confirmación cuando se empieza a dibujar

    // Obtener las coordenadas correctas según el tipo de evento
    let x, y;
    if ("touches" in e) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      x = e.nativeEvent.offsetX * scaleX;
      y = e.nativeEvent.offsetY * scaleY;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;

    // Prevenir el desplazamiento en dispositivos táctiles
    if ("touches" in e) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      const x = (e.touches[0].clientX - rect.left) * scaleX;
      const y = (e.touches[0].clientY - rect.top) * scaleY;

      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      const x = e.nativeEvent.offsetX * scaleX;
      const y = e.nativeEvent.offsetY * scaleY;

      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();

    // No guardamos la firma aquí, solo cuando se confirma
    // para evitar múltiples conversiones
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Dibujar la línea base para la firma
    ctx.beginPath();
    ctx.moveTo(0, canvasRef.current.height - 10);
    ctx.lineTo(canvasRef.current.width, canvasRef.current.height - 10);
    ctx.strokeStyle = "#e5e7eb";
    ctx.stroke();
    
    // Restaurar el color de trazo para la firma
    ctx.strokeStyle = "#000";
    
    setHasSignature(false);
    setSignatureConfirmed(false);
    setValue("firma_digital", null);
  };

  // Manejar la carga de archivos para firma
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Verificar que sea un archivo de imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor, seleccione un archivo de imagen válido");
      return;
    }

    // Guardar el archivo en el estado local y en el formulario
    setUploadedFile(file);
    setValue("firma_digital", file);

    // Limpiar el canvas si hay una firma dibujada
    if (hasSignature && ctx && canvasRef.current) {
      clearCanvas();
    }

    // Si hay una foto subida, la eliminamos
    if (uploadedPhoto) {
      setUploadedPhoto(null);
    }
  };

  // Manejar la carga de fotos de usuario
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Verificar que sea un archivo de imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor, seleccione un archivo de imagen válido");
      return;
    }

    // Guardar el archivo en el estado local y en el formulario
    setUploadedPhoto(file);
    setValue("foto_usuario", file);

    // Limpiar firma digital si existe
    if (hasSignature && ctx && canvasRef.current) {
      clearCanvas();
    }

    // Si hay un archivo de firma subido, lo eliminamos
    if (uploadedFile) {
      setUploadedFile(null);
      setValue("firma_digital", null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Manejar cambio de pestaña
  const handleTabChange = (index: number) => {
    setActiveTab(index);

    // Si cambiamos a la pestaña de dibujo
    if (index === 0) {
      // Si hay un archivo cargado, lo eliminamos si no hay firma dibujada
      if (uploadedFile && !hasSignature) {
        setUploadedFile(null);
        setValue("firma_digital", null);
      }

      // Programamos la reconfiguración del canvas para el siguiente ciclo de renderizado
      setTimeout(() => {
        setupCanvas();
      }, 0);
    }

    // Si cambiamos a la pestaña de subir firma
    else if (index === 1) {
      // Si hay una foto de usuario cargada, mantenemos el valor pero no mostramos la UI
      if (hasSignature) {
        setHasSignature(false);
      }
    }
    // Si cambiamos a la pestaña de foto de usuario
    else if (index === 2) {
      // Si hay una firma dibujada, la limpiamos
      if (hasSignature) {
        clearCanvas();
      }

      // Si hay un archivo de firma subido, lo eliminamos
      if (uploadedFile) {
        setUploadedFile(null);
        setValue("firma_digital", null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // Función para confirmar la firma digital
  const handleConfirmSignature = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const timestamp = new Date().getTime();
        const fileName = `firma_${timestamp}.jpg`;
        const file = await canvasToFile(canvas, fileName);
        setValue("firma_digital", file);
        setSignatureConfirmed(true);
      } catch (error) {
        console.error("Error al guardar la firma:", error);
      }
    }
  };

  return (
    <section className="flex flex-col space-y-8">
      <div>
        <Button
          variant="bordered"
          size="sm"
          onPress={handleBackToInfo}
          startContent={<ArrowLeftIcon className="h-4 w-4" />}
        >
          Volver a tratamientos de datos
        </Button>
      </div>
      <h2 className="text-lg font-medium">
        Firma Autorización de tratamiento de datos
      </h2>
      <Tabs
        aria-label="Firma digital"
        variant="underlined"
        color="primary"
        selectedKey={activeTab.toString()}
        onSelectionChange={(key) => handleTabChange(Number(key))}
      >
        <Tab key="0" title="Firma digital" />
        <Tab key="1" title="Subir firma" />
        <Tab key="2" title="Firma foto de usuario" />
      </Tabs>

      {activeTab === 0 && (
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-w-[800px]">
          <div className="bg-white rounded border border-gray-200 flex justify-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="touch-none cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
          </div>

          {!hasSignature && (
            <p className="text-amber-600 text-sm mt-2">
              Debe dibujar su firma para continuar al siguiente paso.
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={clearCanvas}
            >
              Borrar
            </Button>

            {hasSignature && (
              <Button
                color="success"
                size="sm"
                className="text-white"
                startContent={signatureConfirmed ? <CheckIcon className="h-4 w-4" /> : null}
                onPress={handleConfirmSignature}
              >
                {signatureConfirmed ? "" : "Confirmar firma"}
              </Button>
            )}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-w-[800px] h-[400px]">
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-white rounded border border-gray-200 h-full">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {!uploadedFile ? (
              <div className="text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Haga clic para subir una imagen de su firma
                </p>
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  onPress={() => fileInputRef.current?.click()}
                >
                  Seleccionar archivo
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <CheckIcon className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-sm font-medium">
                    Archivo cargado: {uploadedFile.name}
                  </span>
                </div>
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  onPress={() => {
                    setUploadedFile(null);
                    setValue("firma_digital", null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Eliminar archivo
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-w-[800px] h-[400px]">
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-white rounded border border-gray-200 h-full">
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            {!uploadedPhoto ? (
              <div className="text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Haga clic para subir una foto de usuario
                </p>
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  onPress={() => photoInputRef.current?.click()}
                >
                  Seleccionar foto
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <CheckIcon className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-sm font-medium">
                    Foto cargada: {uploadedPhoto.name}
                  </span>
                </div>
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  onPress={() => {
                    setUploadedPhoto(null);
                    setValue("foto_usuario", null);
                    if (photoInputRef.current) {
                      photoInputRef.current.value = "";
                    }
                  }}
                >
                  Eliminar foto
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <Switch
        onChange={(e) => {
          setValue("confirma_tratamiento_datos", e.target.checked);
        }}
      >
        <span className="text-sm">
          Al firmar, confirmo que he leído y, por lo tanto, acepto todos los
          términos contractuales, que se vuelven legalmente vinculantes.
        </span>
      </Switch>
    </section>
  );
}
