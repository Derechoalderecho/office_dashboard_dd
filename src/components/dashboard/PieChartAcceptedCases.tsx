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

// Define colors for different status types
const STATUS_COLORS = {
  "Viabilidad": "hsl(var(--chart-2))",
  "No aprobado": "hsl(var(--chart-1))",
  "Otros": "hsl(var(--chart-4))",
};

export default function PieChartAcceptedCases() {
  const [cases, setCases] = useState<CaseWithCitizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all cases
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
    
    // Track cases by status
    const statusCounts = {
      "Viabilidad": 0,
      "No aprobado": 0,
      "Otros": 0
    };
    
    cases.forEach(caseItem => {
      // Check the case status
      if (caseItem.estado === "Viabilidad") {
        statusCounts["Viabilidad"]++;
      } else if (caseItem.estado === "No aprobado") {
        statusCounts["No aprobado"]++;
      } else {
        statusCounts["Otros"]++;
      }
    });
    
    // Convert to chart format
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0) // Only include statuses that have cases
      .map(([estado, count]) => ({
        estado,
        count,
        fill: STATUS_COLORS[estado as keyof typeof STATUS_COLORS] || "#CCCCCC",
      }));
  }, [cases]);

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
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribución por Estado</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución por Estado</CardTitle>
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
