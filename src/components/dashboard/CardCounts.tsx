"use client";

import React, { useEffect, useState } from "react";
import {
  UserPlusIcon,
  ChartBarSquareIcon,
  DocumentTextIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { fetchTotalUsuariosConsultorio, fetchCiudadanosAtendidos, fetchCasosAtendidos } from "@/services/dasboardService";
import { Card, CardContent } from "@/components/ui/card";
import { useInternalUserId } from "@/hooks/useInternalUserId";

const iconMap = {
  students: UserPlusIcon,
  citizens: ChartBarSquareIcon,
  cases: DocumentTextIcon,
};

const colorIconMap = {
  students: "bg-[#3CD856]",
  citizens: "bg-primary",
  cases: "bg-[#FF947A]",
};

async function calculateWeeklyChange(type: "students" | "citizens" | "cases", userId?: number): Promise<{
  currentCount: number;
  percentChange: number;
}> {
  if (!userId) {
    console.error("Se requiere userId para obtener datos del dashboard");
    return { currentCount: 0, percentChange: 0 };
  }
  
  try {
    switch (type) {
      case "students":
        // Usar el nuevo endpoint para obtener el total de usuarios
        const totalUsuarios = await fetchTotalUsuariosConsultorio(userId);
        
        // Como no tenemos datos de variación para usuarios, asumimos un valor
        return { 
          currentCount: totalUsuarios, 
          percentChange: 0 // Por defecto no mostramos variación
        };
      
      case "citizens":
        // Usar el nuevo endpoint para obtener total de ciudadanos y su variación
        const ciudadanoData = await fetchCiudadanosAtendidos(userId);
        
        return { 
          currentCount: ciudadanoData.total, 
          percentChange: ciudadanoData.variacion 
        };
      
      case "cases":
        // Usar el nuevo endpoint para obtener total de casos y su variación
        const casoData = await fetchCasosAtendidos(userId);
        
        return { 
          currentCount: casoData.total, 
          percentChange: casoData.variacion 
        };
    }
    
    // Caso por defecto si algo sale mal con los switch cases
    return { currentCount: 0, percentChange: 0 };
  } catch (error) {
    console.error(`Error calculando cambio semanal para ${type}:`, error);
    return { currentCount: 0, percentChange: 0 };
  }
}

export default function CardCountsWrapper() {
  const { internalUserId } = useInternalUserId();

  const [studentsData, setStudentsData] = useState({ currentCount: 0, percentChange: 0 });
  const [citizensData, setCitizensData] = useState({ currentCount: 0, percentChange: 0 });
  const [casesData, setCasesData] = useState({ currentCount: 0, percentChange: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (internalUserId) {
        setIsLoading(true);
        const students = await calculateWeeklyChange("students", internalUserId);
        const citizens = await calculateWeeklyChange("citizens");
        const cases = await calculateWeeklyChange("cases");
        
        setStudentsData(students);
        setCitizensData(citizens);
        setCasesData(cases);
        setIsLoading(false);
      }
    }

    loadData();
  }, [internalUserId]);

  return (
    <>
      <CardCounts
        description="Total de usuarios consultorio"
        value={isLoading ? "..." : studentsData.currentCount}
        percentChange={studentsData.percentChange}
        type="students"
      />
      <CardCounts
        description="Total de ciudadanos"
        value={isLoading ? "..." : citizensData.currentCount}
        percentChange={citizensData.percentChange}
        type="citizens"
      />
      <CardCounts
        description="Total de casos"
        value={isLoading ? "..." : casesData.currentCount}
        percentChange={casesData.percentChange}
        type="cases"
      />
    </>
  );
}

export function CardCounts({
  description,
  value,
  percentChange = 0,
  type,
}: {
  description: string;
  value: number | string;
  percentChange?: number;
  type: "students" | "citizens" | "cases";
}) {
  const Icon = iconMap[type];
  const isPositive = percentChange >= 0;
  const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const trendColor = isPositive ? "text-green-500" : "text-red-500";
  const trendText = isPositive ? "más" : "menos";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-2 pt-4 sm:px-6 sm:pt-6">
        <article className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-[#425166] text-base">{description}</p>
            <h3 className="text-[#202224] text-4xl font-semibold">{value}</h3>
          </div>
          <div className={`${colorIconMap[type]} rounded-xl p-4`}>
            {Icon ? <Icon className="h-8 w-8 text-white" /> : null}
          </div>
        </article>
        <div className="flex items-center gap-2">
          <TrendIcon className={`h-6 w-6 ${trendColor}`} />
          <p className={`text-base ${trendColor}`}>{Math.abs(percentChange)}%</p>
          <p className="text-[#425166] text-base">{trendText} que la semana pasada</p>
        </div>
      </CardContent>
    </Card>
  );
}
