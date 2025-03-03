"use client";

import { TrendingUp } from "lucide-react";
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
import { useMemo } from "react";

// Manual data for procedure types
const procedureData = [
  { procedure_type: "Ganados", count: 19, fill: "hsla(130, 67%, 54%, 1)" },
  { procedure_type: "Perdidos", count: 2, fill: "hsl(0, 70%, 50%)" },
];

// Chart configuration
const chartConfig = {
  count: {
    label: "Cantidad",
  },
  "Ganados": {
    label: "Ganados",
    color: "#4285F4",
  },
  "Perdidos": {
    label: "Perdidos",
    color: "hsla(261, 99%, 64%, 1)",
  },
  "Conciliación": {
    label: "Conciliación",
    color: "#FF9900",
  },
  "Audiencia": {
    label: "Audiencia",
    color: "hsla(233, 100%, 89%, 1)",
  },
  "Otro": {
    label: "Otro",
    color: "#34A853",
  },
} satisfies ChartConfig;

export default function PieChartProcedures() {
  // Calculate total procedures
  const totalProcedures = useMemo(() => {
    return procedureData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución Casos Ganados y Perdidos</CardTitle>
        <CardDescription>Total de Casos: {totalProcedures}</CardDescription>
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
              data={procedureData}
              dataKey="count"
              nameKey="procedure_type"
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
                          {totalProcedures.toLocaleString()}
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
          {procedureData.map((item) => (
            <div key={item.procedure_type} className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs">{item.procedure_type}</span>
            </div>
          ))}
        </div>
        <div className="leading-none text-muted-foreground text-center pt-2">
          Distribución de Casos Ganados y Perdidos según el resultado
        </div>
      </CardFooter>
    </Card>
  );
}
