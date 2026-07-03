import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

export function RelatorioPlaceholder() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">
        Relatório protegido — em construção
      </p>
      <p className="text-sm">
        Logado como <span className="font-medium">{user?.email}</span>
      </p>
      <Button variant="outline" onClick={() => signOut()}>
        Sair
      </Button>
    </div>
  );
}
