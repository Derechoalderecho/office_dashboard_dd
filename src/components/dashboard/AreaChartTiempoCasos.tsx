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
import { Tabs, Tab, Spinner } from "@heroui/react"
import { fetchSerieTiempoCasos, Frecuencia, TipoCaso } from "@/services/dasboardService"
import { useInternalUserId } from "@/hooks/useInternalUserId"

interface ChartDataPoint {
  fecha: string;
  aceptados?: number;
  recibidos?: number;
  todos?: number;
}

type TabKey = "todos" | "aceptados-recibidos";

// Definir colores HSL concretos
const COLOR_TODOS = "hsl(220, 70%, 50%)"; // Azul intenso
const COLOR_ACEPTADOS = "hsl(145, 63%, 42%)"; // Verde
const COLOR_RECIBIDOS = "hsl(345, 82%, 63%)"; // Rojo cereza

const configTodos = {
  count: {
    label: "Casos",
  },
  todos: {
    label: "Todos",
    color: COLOR_TODOS,
  },
} satisfies ChartConfig;

const configAceptadosRecibidos = {
  count: {
    label: "Casos",
  },
  aceptados: {
    label: "Aceptados",
    color: COLOR_ACEPTADOS,
  },
  recibidos: {
    label: "Recibidos",
    color: COLOR_RECIBIDOS,
  },
} satisfies ChartConfig;

export default function AreaChartTiempoCasos() {
  const { internalUserId } = useInternalUserId();
  const [frecuencia, setFrecuencia] = React.useState<Frecuencia>("semanal");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabKey>("aceptados-recibidos");

  // Cargar datos cuando cambia la frecuencia, el ID de usuario o la pestaña activa
  React.useEffect(() => {
    const loadData = async () => {
      if (!internalUserId) return;
      
      try {
        setIsLoading(true);
        
        if (activeTab === "todos") {
          // Cargar datos de todos los casos
          const todosData = await fetchSerieTiempoCasos(
            internalUserId, 
            frecuencia, 
            "todos"
          );
          
          // Convertir los datos al formato necesario para el gráfico
          const formattedData = todosData.map(item => ({
            fecha: item.fecha,
            todos: item.total_casos
          }));
          
          // Ordenar por fecha
          const sortedData = formattedData.sort((a, b) => 
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          );
          
          setChartData(sortedData);
        } else {
          // Cargar datos de casos aceptados y recibidos
          const aceptadosData = await fetchSerieTiempoCasos(
            internalUserId, 
            frecuencia, 
            "aceptados"
          );
          
          const recibidosData = await fetchSerieTiempoCasos(
            internalUserId, 
            frecuencia, 
            "recibidos"
          );
          
          // Combinar los datos para mostrarlos en un solo gráfico
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
        }
      } catch (error) {
        console.error("Error loading tiempo casos data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [internalUserId, frecuencia, activeTab]);

  // Formatea la fecha para el tooltip
  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <Card className={isLoading ? "opacity-80" : ""}>
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
        <Select 
          value={frecuencia} 
          onValueChange={(value) => setFrecuencia(value as Frecuencia)}
          disabled={isLoading}
        >
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

      <div className="px-2 sm:px-6">
        <Tabs 
          variant="underlined"
          color="primary"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as TabKey)}
          isDisabled={isLoading}
          classNames={{
            tabList: "border-b border-divider w-full mb-4",
            cursor: "w-full bg-primary"
          }}
        >
          <Tab key="aceptados-recibidos" title="Casos Aceptados y Recibidos" />
          <Tab key="todos" title="Todos los Casos" />
        </Tabs>
      </div>
      
      <CardContent className="px-2 pt-0 sm:px-6 sm:pt-2 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50">
            <Spinner size="lg" color="primary" />
          </div>
        )}
        {activeTab === "todos" ? (
          <ChartContainer
            config={configTodos}
            className="aspect-auto h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillTodos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_TODOS} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLOR_TODOS} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => formatDate(value)}
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
                  dataKey="todos"
                  stroke={COLOR_TODOS}
                  fill="url(#fillTodos)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <ChartContainer
            config={configAceptadosRecibidos}
            className="aspect-auto h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillAceptados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_ACEPTADOS} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLOR_ACEPTADOS} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillRecibidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_RECIBIDOS} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLOR_RECIBIDOS} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => formatDate(value)}
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
                  stroke={COLOR_RECIBIDOS}
                  fill="url(#fillRecibidos)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="aceptados"
                  stroke={COLOR_ACEPTADOS}
                  fill="url(#fillAceptados)"
                  stackId="1"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
