import { Button, Tabs, Tab } from "@heroui/react";
import { useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";

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
  const { setValue } = useFormContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Inicializar el canvas cuando el componente se monta
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ajustar el tamaño del canvas al tamaño del contenedor
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
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
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Manejar eventos de dibujo
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!ctx || !canvasRef.current) return;
    setIsDrawing(true);
    setHasSignature(true);

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

    // Redibujar la línea base
    ctx.beginPath();
    ctx.moveTo(0, canvasRef.current.height - 10);
    ctx.lineTo(canvasRef.current.width, canvasRef.current.height - 10);
    ctx.strokeStyle = "#e5e7eb";
    ctx.stroke();

    // Restaurar el color de trazo para la firma
    ctx.strokeStyle = "#000";

    setHasSignature(false);
    setValue("firma_digital", null);
  };

  return (
    <section className="flex flex-col space-y-8">
      <h2 className="text-lg font-medium">
        Firma Autorización de tratamiento de datos
      </h2>
      <Tabs aria-label="Firma digital" variant="underlined" color="primary">
        <Tab title="Firma digital" />
        <Tab title="Subir firma" />
        <Tab title="Firma foto de usuario" />
      </Tabs>

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
          <Button size="sm" variant="flat" color="danger" onPress={clearCanvas}>
            Borrar
          </Button>

          {hasSignature && (
            <Button
              color="success"
              size="sm"
              className="text-white"
              onPress={async () => {
                // Guardar la firma como archivo JPEG
                const canvas = canvasRef.current;
                if (canvas) {
                  try {
                    const timestamp = new Date().getTime();
                    const fileName = `firma_${timestamp}.jpg`;

                    const file = await canvasToFile(canvas, fileName);

                    setValue("firma_digital", file);
                  } catch (error) {
                    console.error("Error al guardar la firma:", error);
                  }
                }
              }}
              startContent={<CheckIcon className="h-4 w-4" />}
            >
              Confirmar firma
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="bordered"
          size="sm"
          onPress={handleBackToInfo}
          startContent={<ArrowLeftIcon className="h-4 w-4" />}
        >
          Volver
        </Button>
      </div>
    </section>
  );
}
