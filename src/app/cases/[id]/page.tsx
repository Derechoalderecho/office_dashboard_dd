"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Cases } from "@/types/cases";

interface CasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CasePage(props: CasePageProps) {
  const params = await props.params;
  const { id } = await params;

  console.log(params);

  const caseDoc = await getDoc(doc(db, "cases", id));
  if (!caseDoc.exists()) {
    return <div>Case not found</div>;
  }

  const caseData = caseDoc.data() as Cases;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Case Details</h1>
      <div className="space-y-4">
        <div>
          <strong>ID:</strong> {id}
        </div>
        <div>
          <strong>Name:</strong> {caseData.name}
        </div>
        <div>
          <strong>Email:</strong> {caseData.email}
        </div>
        <div>
          <strong>Phone:</strong> {caseData.phone}
        </div>
        <div>
          <strong>Status:</strong> {caseData.status}
        </div>
        <div>
          <strong>Process Type:</strong> {caseData.proccess_type}
        </div>
        <div>
          <strong>Created:</strong> {caseData.created}
        </div>
        <div>
          <strong>Updated:</strong> {caseData.update}
        </div>
        <div>
          <strong>Assigned:</strong> {caseData.assigned.name}
        </div>
        <div>
          <strong>Response Time:</strong> {caseData.response_time} hours
        </div>
        <div>
          <strong>Registration History:</strong>
          <ul>
            {caseData.registration_history.map((history, index) => (
              <li key={index}>
                {history.status} - {history.date}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}