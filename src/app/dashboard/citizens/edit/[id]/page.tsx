"use client";

import { Suspense } from "react";
import CitizenEditForm from "@/components/citizens/edit/CitizenEditForm";
import { Spinner } from "@heroui/react";
import { useParams } from "next/navigation";

interface EditCitizenPageProps {
  params: {
    id: string;
  };
}

export default function EditCitizenPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto">
      <Suspense fallback={<div className="flex justify-center items-center"><Spinner size="lg" /></div>}>
        <CitizenEditForm citizenId={id} />
      </Suspense>
    </div>
  );
} 