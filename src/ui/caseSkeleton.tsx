export default function caseSkeleton() {
  return (
    <main>
    <div className="space-y-6">
      {/* Skeleton para el encabezado */}
      <div className="animate-pulse mb-7 pb-4 border-b-1">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-10"></div>
          </div>
        </div>
      </div>
      
      {/* Skeleton para el contenido */}
      <section className="flex gap-6">
        {/* Columna principal */}
        <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
          <div className="p-5">
            {/* Título */}
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <hr className="my-4" />
            
            {/* Info del caso */}
            <div className="animate-pulse flex justify-between mb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-40 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-36 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-28 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            <hr className="my-4" />
            
            {/* Skeleton de previsualización de tutela */}
            <div className="mb-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-8">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-56 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-72 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-40"></div>
                </div>
              </div>
            </div>
            
            {/* Skeleton de documentos */}
            <div className="mb-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Panel lateral */}
        <aside className="w-[30%]">
          {/* Skeleton de notas */}
          <div className="animate-pulse mb-5">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="mb-4 border rounded-lg">
              <div className="h-24 bg-gray-100 rounded-t-lg"></div>
              <div className="h-10 bg-gray-50 rounded-b-lg flex items-center justify-end p-2">
                <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          
          <hr className="my-5" />
          
          {/* Skeleton de registro de cambios */}
          <div className="h-6 bg-gray-200 rounded w-56 mb-8"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </aside>
      </section>
    </div>
  </main>
  )
}

