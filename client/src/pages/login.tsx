import { useState } from "react";
import { useLocation } from "wouter";
import { login, isLoggedIn } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isLoggedIn()) {
    navigate("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      toast({ title: "Login realizado com sucesso" });
      navigate("/");
    } else {
      toast({ title: "Credenciais inválidas", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <form
        className="flex flex-col gap-4 w-full max-w-sm p-6 border rounded-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-bold text-center">Login</h1>
        <Input
          type="text"
          placeholder="Usuário"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
