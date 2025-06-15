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
import { fetchCasosGanadosPerdidos } from "@/services/dasboardService";
import { useInternalUserId } from "@/hooks/useInternalUserId";

// Define colors for the pie chart segments
const STATUS_COLORS = {
  "Ganados": "hsl(var(--chart-3))",
  "Perdidos": "hsl(var(--chart-4))",
};

type CasosPieData = {
  estado: string;
  count: number;
  fill: string;
}

export default function PieChartGanadosPerdidos() {
  const { internalUserId } = useInternalUserId();
  const [data, setData] = useState<{ ganados: number; perdidos: number }>({ ganados: 0, perdidos: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cases data
  useEffect(() => {
    const loadData = async () => {
      if (!internalUserId) return;
      
      try {
        setIsLoading(true);
        const casosData = await fetchCasosGanadosPerdidos(internalUserId);
        setData(casosData);
      } catch (error) {
        console.error("Error loading casos ganados vs perdidos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [internalUserId]);

  // Process the data for the chart
  const chartData = useMemo((): CasosPieData[] => {
    if (data.ganados === 0 && data.perdidos === 0) return [];
    
    return [
      {
        estado: "Ganados",
        count: data.ganados,
        fill: STATUS_COLORS["Ganados"]
      },
      {
        estado: "Perdidos",
        count: data.perdidos,
        fill: STATUS_COLORS["Perdidos"]
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
    return data.ganados + data.perdidos;
  }, [data]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Casos Ganados vs Perdidos</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Casos Ganados vs Perdidos</CardTitle>
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
