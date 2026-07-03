import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../use-auth";

type LoginFormProps = {
  onSucesso?: () => void;
};

export function LoginForm({ onSucesso }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    setErro(null);
    setIsPending(true);
    try {
      await signIn(email, senha);
      onSucesso?.();
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setIsPending(false);
    }
  }

  const podeEnviar = email.trim() !== "" && senha.trim() !== "" && !isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && podeEnviar && handleSubmit()}
          autoComplete="email"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && podeEnviar && handleSubmit()}
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Button onClick={handleSubmit} disabled={!podeEnviar}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </div>
  );
}
