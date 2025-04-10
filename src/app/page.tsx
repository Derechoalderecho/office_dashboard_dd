import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
      <div className="text-center px-4 max-w-3xl">
        {/* Logo y título */}
        <div className="mb-10 flex flex-col items-center">
          <img src="/icons/logo.svg" alt="Logo" className="h-20 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">
            Derecho al Derecho
          </h1>
        </div>

        {/* Mensaje de bienvenida */}
        <p className="text-xl text-gray-600 mb-10">
          Bienvenido a la plataforma de Consultorios Jurídicos	
        </p>

        {/* Botones de acceso */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/cases"
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Ingresar al Dashboard
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-primary border border-primary rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>

        {/* Footer simple */}
        <p className="mt-16 text-gray-500 text-sm">
          © 2024 Legal Office. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
