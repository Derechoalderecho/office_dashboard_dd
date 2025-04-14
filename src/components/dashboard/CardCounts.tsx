import {
  UserPlusIcon,
  ChartBarSquareIcon,
  DocumentTextIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { fetchAllUsers } from "@/services/userService";
import { fetchAllCasesDashboard } from "@/services/caseService";
import { fetchAllCitizens } from "@/services/citizenService";
import { Card, CardContent } from "@/components/ui/card";

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

async function calculateWeeklyChange(type: "students" | "citizens" | "cases"): Promise<{
  currentCount: number;
  percentChange: number;
}> {
  const currentDate = new Date();
  const oneWeekAgo = new Date(currentDate);
  oneWeekAgo.setDate(currentDate.getDate() - 7);
  
  let currentCount = 0;
  let previousCount = 0;
  
  try {
    switch (type) {
      case "students":
        const allUsers = await fetchAllUsers();
        currentCount = allUsers.length;
        // Filter users created before one week ago
        previousCount = allUsers.filter(user => 
          new Date(user.fecha_creacion || "") < oneWeekAgo
        ).length;
        break;
      
      case "citizens":
        const allCitizens = await fetchAllCitizens();
        currentCount = allCitizens.length;
        // Filter citizens created before one week ago
        previousCount = allCitizens.filter(citizen => 
          new Date(citizen.fecha_crea || "") < oneWeekAgo
        ).length;
        break;
      
      case "cases":
        const allCases = await fetchAllCasesDashboard();
        currentCount = allCases.length;
        // Filter cases created before one week ago
        previousCount = allCases.filter(caseItem => 
          new Date(caseItem.fecha_crea) < oneWeekAgo
        ).length;
        break;
    }
    
    const percentChange = previousCount === 0 
      ? 100 
      : ((currentCount - previousCount) / previousCount) * 100;
    
    return { 
      currentCount, 
      percentChange: Math.round(percentChange * 10) / 10 
    };
  } catch (error) {
    console.error(`Error calculando cambio semanal para ${type}:`, error);
    return { currentCount: 0, percentChange: 0 };
  }
}

export default async function CardCountsWrapper() {
  const studentsData = await calculateWeeklyChange("students");
  const citizensData = await calculateWeeklyChange("citizens");
  const casesData = await calculateWeeklyChange("cases");

  return (
    <>
      <CardCounts
        description="Total de estudiantes"
        value={studentsData.currentCount}
        percentChange={studentsData.percentChange}
        type="students"
      />
      <CardCounts
        description="Total de ciudadanos"
        value={citizensData.currentCount}
        percentChange={citizensData.percentChange}
        type="citizens"
      />
      <CardCounts
        description="Total de casos"
        value={casesData.currentCount}
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
