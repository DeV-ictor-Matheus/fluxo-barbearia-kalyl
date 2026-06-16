import { useAtendentes } from "@/features/atendentes/use-atendentes";

function App() {
  const { data: atendentes, isLoading, isError, error } = useAtendentes();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold">Barbearia Kalyl</h1>

      {isLoading && (
        <p className="text-muted-foreground">Carregando atendentes...</p>
      )}

      {isError && <p className="text-red-500">Erro: {error.message}</p>}

      {atendentes && (
        <ul className="flex flex-col gap-2">
          {atendentes.map((a) => (
            <li key={a.id} className="rounded border px-4 py-2">
              {a.nome} —{" "}
              <span className="text-muted-foreground">{a.papel}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
