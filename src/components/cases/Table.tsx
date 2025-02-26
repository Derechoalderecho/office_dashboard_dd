"use client";

import { useFetchCollection } from '@/hooks/useFetchCollection'
import { Cases } from '@/types/cases';

export default function Table() {
  const { data, loading, error } = useFetchCollection<Cases>("cases");
  console.log(data);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

