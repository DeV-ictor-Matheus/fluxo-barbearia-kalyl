import { useState } from "react";
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-[13px] font-medium text-zinc-400"
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && podeEnviar && handleSubmit()}
          autoComplete="email"
          disabled={isPending}
          className="h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-[15px] text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500/60 focus:bg-zinc-900 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="senha"
          className="text-[13px] font-medium text-zinc-400"
        >
          Senha
        </label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && podeEnviar && handleSubmit()}
          autoComplete="current-password"
          disabled={isPending}
          className="h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-[15px] text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500/60 disabled:opacity-50"
        />
      </div>

      {erro && (
        <p className="rounded-lg border border-red-950 bg-red-950/40 px-3 py-2 text-[13px] text-red-400">
          {erro}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!podeEnviar}
        className="mt-1 h-11 rounded-xl bg-amber-500 text-[15px] font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </div>
  );
}
