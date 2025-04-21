import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [_, navigate] = useLocation();

  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return null;
}