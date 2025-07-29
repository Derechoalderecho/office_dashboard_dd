import { Button } from "@heroui/react";
import { useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";

interface Step2SubStep2Props {
  handleBackToInfo: () => void;
}

export default function Step2SubStep2({ handleBackToInfo }: Step2SubStep2Props) {
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
        const width = 600;
        const height = 400;
        
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
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Manejar eventos de dibujo
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;
    setIsDrawing(true);
    setHasSignature(true);
    
    // Obtener las coordenadas correctas según el tipo de evento
    let x, y;
    if ('touches' in e) {
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

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    // Prevenir el desplazamiento en dispositivos táctiles
    if ('touches' in e) {
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
    
    // Guardar la firma como base64 en el formulario
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const signatureBase64 = canvas.toDataURL("image/png");
      setValue("firma_digital", signatureBase64);
    }
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
    setValue("firma_digital", "");
  };

  return (
    <section className="flex flex-col space-y-8">
      <div>
        <h2 className="text-lg font-medium mb-2">Firma digital</h2>
        <p className="text-sm text-gray-500 mb-6">
          Por favor dibuje su firma en el recuadro a continuación para autorizar el tratamiento de sus datos personales.
        </p>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-w-2xl">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Firme aquí</span>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            onPress={clearCanvas}
          >
            Borrar
          </Button>
        </div>
        
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
      </div>
    </section>
  );
}
