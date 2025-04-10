"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from "@heroui/react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard/cases"); // Redirect to cases page after login
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex w-full p-3">
      <section className="w-1/2">
        <Image
          className="w-full h-screen object-cover rounded-2xl"
          src="/images/image-login.png"
          alt="Background image"
          width={1000}
          height={1000}
        />
      </section>
      <section className="w-1/2 h-screen flex flex-col justify-center px-20 max-w-[600px] mx-auto">
        <Image
          src="/images/logo-login.png"
          className="w-12 pb-20"
          alt="Logo image"
          width={1000}
          height={1000}
        />
        <div className="mb-12">
          <h1 className="font-poppins font-medium text-3xl">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="font-poppins font-medium">
            Introduzca sus credenciales para acceder a su cuenta
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            onChange={(e) => setEmail(e.target.value)}
            isRequired
            type="email"
            variant="bordered"
            label="Dirección de correo electrónico"
            placeholder="Introduzca su correo electrónico"
            labelPlacement="outside"
            className="font-poppins mb-6"
          />
          <Input
            onChange={(e) => setPassword(e.target.value)}
            isRequired
            type="password"
            variant="bordered"
            label="Contraseña"
            placeholder="Introduzca su contraseña"
            labelPlacement="outside"
            className="mb-12"
          />
          <Button type="submit" color="primary" fullWidth disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
        {/*  <Button
      onClick={handleProviderLogin}
      className="font-poppins w-full bg-[#0081FE] text-white"
    >
      Google
    </Button> */}
      </section>
    </main>
  );
}
