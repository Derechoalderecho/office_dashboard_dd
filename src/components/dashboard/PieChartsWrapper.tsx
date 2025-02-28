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
import { fetchAllCases } from "@/services/caseService";

const chartData = [
  { branch_law: "civil_law", procedures: 275, fill: "#4285F4" },
  { branch_law: "laboral_law", procedures: 200, fill: "hsla(261, 99%, 64%, 1)" },
  { branch_law: "family_law", procedures: 287, fill: "#FF9900" },
  { branch_law: "criminal_law", procedures: 173, fill: "hsla(233, 100%, 89%, 1)" },
];
const chartConfig = {
  procedures: {
    label: "Procedimientos",
  },
  civil_law: {
    label: "Civil",
    color: "#4285F4",
  },
  laboral_law: {
    label: "Laboral",
    color: "hsla(261, 99%, 64%, 1)",
  },
  family_law: {
    label: "Familia",
    color: "#FF9900",
  },
  criminal_law: {
    label: "Penal",
    color: "hsla(233, 100%, 89%, 1)",
  },
} satisfies ChartConfig;

export default function PieChartsWrapper() {

  const totalProcedures = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.procedures, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
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
              dataKey="procedures"
              nameKey="branch_law"
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
                          Visitors
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
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
