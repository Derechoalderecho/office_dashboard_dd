"use client";

import dynamic from "next/dynamic";

const TableReviewers = dynamic(() => import("@/components/reviewers/Table"), {
  ssr: false,
});

export default function ReviewersPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-primary mb-7">Revisores</h1>
      <section className="flex flex-col gap-2 pb-8">
        <p className="text-[#808080] text-sm">
          Filtra los revisores por su nombre
        </p>
       
      </section>
    </>
  );
}
