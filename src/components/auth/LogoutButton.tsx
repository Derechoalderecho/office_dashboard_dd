"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@heroui/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      color="danger"
      variant="bordered"
      size="md"
      onPress={handleLogout}
      disabled={loading}
      startContent={<LogOut size={16} />}
    >
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}
