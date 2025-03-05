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
import { fetchAllCases } from "@/services/caseService";
import { Cases } from "@/types/cases";
import { Citizen } from "@/types/citizens";

// Define the CaseWithCitizen type locally
type CaseWithCitizen = Cases & { ciudadano: Citizen };

// Define colors for different process types
const PROCESS_COLORS = {
  "Consulta": "#4285F4",
  "Asesoría": "hsla(261, 99%, 64%, 1)",
  "Representación": "#FF9900",
  "Mediación": "hsla(233, 100%, 89%, 1)",
  "Otro": "#34A853",
};

export default function PieChartCases() {
  const [cases, setCases] = useState<CaseWithCitizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all procedures
  useEffect(() => {
    const loadCases = async () => {
      try {
        const casesData = await fetchAllCases();
        setCases(casesData);
      } catch (error) {
        console.error("Error loading cases for chart:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCases();
  }, []);

  // Process the data for the chart
  const chartData = useMemo(() => {
    if (!cases.length) return [];
    
    // Count procedures by process type
    const processCounts: Record<string, number> = {};
    
    cases.forEach(caseItem => {
      const processType = caseItem.tipo_proceso || "No especificado";
      processCounts[processType] = (processCounts[processType] || 0) + 1;
    });
    
    // Convert to chart format
    return Object.entries(processCounts).map(([tipo_proceso, count], index) => ({
      tipo_proceso,
      count,
      fill: PROCESS_COLORS[tipo_proceso as keyof typeof PROCESS_COLORS] || `hsl(${index * 50}, 70%, 50%)`,
    }));
  }, [cases]);

  // Create chart config dynamically
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Cantidad",
      },
    };
    
    // Add each process type to the config
    chartData.forEach(item => {
      config[item.tipo_proceso] = {
        label: item.tipo_proceso,
        color: item.fill,
      };
    });
    
    return config;
  }, [chartData]);

  // Calculate total procedures
  const totalprocedures = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribución por Tipo de Trámite</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución por Tipo de Trámite</CardTitle>
        <CardDescription>Total de trámites: {totalprocedures}</CardDescription>
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
              nameKey="tipo_proceso"
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
                          {totalprocedures.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Trámites
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
            <div key={item.tipo_proceso} className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs">{item.tipo_proceso}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
