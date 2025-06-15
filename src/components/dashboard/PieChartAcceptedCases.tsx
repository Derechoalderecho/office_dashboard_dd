"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useMemo, useState } from "react";
import { fetchCasosAceptadosRecibidos } from "@/services/dasboardService";
import { useInternalUserId } from "@/hooks/useInternalUserId";

// Define colors for the pie chart segments
const STATUS_COLORS = {
  "Aceptados": "hsl(var(--chart-2))",
  "Recibidos": "hsl(var(--chart-1))",
};

type CasosPieData = {
  estado: string;
  count: number;
  fill: string;
}

export default function PieChartAcceptedCases() {
  const { internalUserId } = useInternalUserId();
  const [data, setData] = useState<{ aceptados: number; recibidos: number }>({ aceptados: 0, recibidos: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cases data
  useEffect(() => {
    const loadData = async () => {
      if (!internalUserId) return;
      
      try {
        setIsLoading(true);
        const casosData = await fetchCasosAceptadosRecibidos(internalUserId);
        setData(casosData);
      } catch (error) {
        console.error("Error loading casos aceptados vs recibidos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [internalUserId]);

  // Process the data for the chart
  const chartData = useMemo((): CasosPieData[] => {
    if (data.aceptados === 0 && data.recibidos === 0) return [];
    
    return [
      {
        estado: "Aceptados",
        count: data.aceptados,
        fill: STATUS_COLORS["Aceptados"]
      },
      {
        estado: "Recibidos",
        count: data.recibidos - data.aceptados, 
        fill: STATUS_COLORS["Recibidos"]
      }
    ].filter(item => item.count > 0); 
  }, [data]);

  // Create chart config dynamically
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Cantidad",
      },
    };
    
    // Add each status to the config
    chartData.forEach(item => {
      config[item.estado] = {
        label: item.estado,
        color: item.fill,
      };
    });
    
    return config;
  }, [chartData]);

  // Calculate total cases
  const totalCases = useMemo(() => {
    return data.recibidos;
  }, [data]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Casos Aceptados vs Recibidos</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Casos Aceptados vs Recibidos</CardTitle>
        <CardDescription>Total de casos: {totalCases}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="estado"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCases.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Casos
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-4 pt-2">
          {chartData.map((item) => (
            <div key={item.estado} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs">{item.estado}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
