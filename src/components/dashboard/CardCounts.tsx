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

const backgroundColorMap = {
  students: "bg-[#CBFFD2]",
  citizens: "bg-[#CDE6FF]",
  cases: "bg-[#FFF0C6]",
};

const colorIconMap = {
  students: "bg-[#3CD856]",
  citizens: "bg-primary",
  cases: "bg-[#FF947A]",
};

export default async function CardCountsWrapper() {
  const users = await fetchAllUsers();
  const cases = await fetchAllCasesDashboard();
  const citizens = await fetchAllCitizens();

  const totalStudents = users.length;
  const totalCases = cases.length;
  const totalCitizens = citizens.length;

  return (
    <>
      <CardCounts
        description="Total de estudiantes"
        value={totalStudents}
        type="students"
      />
      <CardCounts
        description="Total de ciudadanos"
        value={totalCitizens}
        type="citizens"
      />
      <CardCounts
        description="Total de casos"
        value={totalCases}
        type="cases"
      />
    </>
  );
}

export function CardCounts({
  description,
  value,
  type,
}: {
  description: string;
  value: number | string;
  type: "students" | "citizens" | "cases";
}) {
  const Icon = iconMap[type];

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
          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
          <p className="text-[#425166] text-base">10%</p>
          <p className="text-[#425166] text-base">más que la semana pasada</p>
        </div>
      </CardContent>
    </Card>
  );
}
