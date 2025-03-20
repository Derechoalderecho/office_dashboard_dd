"use client";

import { CloudArrowDownIcon } from "@heroicons/react/24/outline";

interface DocumentDownloaderProps {
  caseId: number;
  documentUrl?: string;
}

export default function DocumentDownloader({ 
  caseId, 
  documentUrl 
}: DocumentDownloaderProps) {
  
  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      console.log("No document available to download");
      // Could implement a notification here
    }
  };
  
  return (
    <div className="w-full h-full">
      <button
        onClick={handleDownload}
        className="flex flex-col items-center px-5 justify-center w-full h-64 border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <CloudArrowDownIcon className="w-12 h-12 text-gray-400" />
          <p className="mb-2 text-sm text-center text-gray-500">
            Click para <span className="font-bold">descargar</span> el
            archivo
          </p>
          <p className="text-xs text-gray-500">docx, pdf</p>
        </div>
      </button>
    </div>
  );
} 