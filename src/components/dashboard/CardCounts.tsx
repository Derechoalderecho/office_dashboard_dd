import {
  UserPlusIcon,
  ChartBarSquareIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { fetchAllUsers } from "@/services/userService";
import { fetchAllCases } from "@/services/caseService";

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
  const cases = await fetchAllCases();

  const totalStudents = users.length;
  const totalCases = cases.length;

  return (
    <>
      <CardCounts
        description="Total de estudiantes"
        value={totalStudents}
        type="students"
      />
      <CardCounts
        description="Total de ciudadanos"
        value={100}
        type="citizens"
      />
      <CardCounts description="Total de casos" value={totalCases} type="cases" />
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
    <article
      className={`relative w-full flex flex-col items-center justify-center py-16 rounded-xl ${backgroundColorMap[type]}`}
    >
      <div
        className={`${colorIconMap[type]} absolute right-5 top-5 rounded-full p-2`}
      >
        {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
      </div>
      <h3 className="text-[#151D48] text-5xl font-semibold">{value}</h3>
      <p className="text-[#425166] text-base font-medium mt-2">{description}</p>
      <p className="text-[#4079ED] text-sm mt-2 hover:text-[#456bb6]">
        mostrar más
      </p>
    </article>
  );
}
