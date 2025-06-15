"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchSerieTiempoCasos, Frecuencia } from "@/services/dasboardService"
import { useInternalUserId } from "@/hooks/useInternalUserId"

interface ChartDataPoint {
  fecha: string;
  aceptados: number;
  recibidos: number;
}

const chartConfig = {
  count: {
    label: "Casos",
  },
  aceptados: {
    label: "Aceptados",
    color: "var(--chart-3)",
  },
  recibidos: {
    label: "Recibidos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function AreaChartTiempoCasos() {
  const { internalUserId } = useInternalUserId();
  const [frecuencia, setFrecuencia] = React.useState<Frecuencia>("semanal");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);

  // Cargar datos cuando cambia la frecuencia o el ID de usuario
  React.useEffect(() => {
    const loadData = async () => {
      if (!internalUserId) return;
      
      try {
        setIsLoading(true);
        
        // Obtener datos de casos aceptados
        const aceptadosData = await fetchSerieTiempoCasos(
          internalUserId, 
          frecuencia, 
          "aceptados"
        );
        
        // Obtener datos de casos recibidos
        const recibidosData = await fetchSerieTiempoCasos(
          internalUserId, 
          frecuencia, 
          "recibidos"
        );
        
        // Combinar los datos para mostrarlos en un solo gráfico
        const combinedData: ChartDataPoint[] = [];
        
        // Crear un mapa de fechas para facilitar la combinación
        const fechasMap = new Map<string, ChartDataPoint>();
        
        // Inicializar con los datos de casos aceptados
        aceptadosData.forEach(item => {
          fechasMap.set(item.fecha, {
            fecha: item.fecha,
            aceptados: item.total_casos,
            recibidos: 0
          });
        });
        
        // Añadir los datos de casos recibidos
        recibidosData.forEach(item => {
          if (fechasMap.has(item.fecha)) {
            const existingData = fechasMap.get(item.fecha)!;
            existingData.recibidos = item.total_casos;
          } else {
            fechasMap.set(item.fecha, {
              fecha: item.fecha,
              aceptados: 0,
              recibidos: item.total_casos
            });
          }
        });
        
        // Convertir el mapa a un array y ordenar por fecha
        const sortedData = Array.from(fechasMap.values()).sort((a, b) => 
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        
        setChartData(sortedData);
      } catch (error) {
        console.error("Error loading tiempo casos data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [internalUserId, frecuencia]);

  // Formatea la fecha para el tooltip
  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Evolución de Casos</CardTitle>
          <CardDescription>
            {isLoading 
              ? "Cargando datos..." 
              : `Mostrando evolución ${frecuencia === "semanal" ? "semanal" : "diaria"} de casos`
            }
          </CardDescription>
        </div>
        <Select value={frecuencia} onValueChange={(value) => setFrecuencia(value as Frecuencia)}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Seleccionar frecuencia"
          >
            <SelectValue placeholder="Frecuencia" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="semanal" className="rounded-lg">
              Semanal
            </SelectItem>
            <SelectItem value="diaria" className="rounded-lg">
              Diaria
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillAceptados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillRecibidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return formatDate(value);
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDate(value)}
                    indicator="dot"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="recibidos"
                stroke="var(--chart-1)"
                fill="url(#fillRecibidos)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="aceptados"
                stroke="var(--chart-3)"
                fill="url(#fillAceptados)"
                stackId="1"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
