"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Alert, Form } from "@heroui/react";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Evitar hydration mismatch: renderizar sólo en cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Autenticación con Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard/cases");
    } catch (error: any) {
      const code = error?.code || "";
      const message: string = error?.message || "No se pudo iniciar sesión";
      const isInvalidCred = code === "auth/invalid-credential" || message.includes("auth/invalid-credential");
      setError(isInvalidCred ? "Email o contraseña inválidos" : message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

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
          <Alert
            color="danger"
            variant="flat"
            title="Error"
            description={error}
            className="mb-16"
          />
        )}
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        </Form>
      </section>
    </main>
  );
}
