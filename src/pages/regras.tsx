import { Header } from "@/components/header"

export default function Regras() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-[2fr,1fr] gap-12">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Regras de Condutas para Terceiros</h1>

              <div className="space-y-4 text-foreground leading-relaxed">
                <p>Aqui você encontra as Regras de Conduta para Terceiros da Aliança Empreendedora na íntegra.</p>

                <p>Clique nos tópicos abaixo para conhecê-lo.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Introdução</h2>

              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-foreground hover:text-primary underline font-medium transition-colors"
                >
                  1 - POLÍTICA ANTICORRUPÇÃO - CONCEITO GERAL
                </a>

                <a
                  href="#"
                  className="block text-foreground hover:text-primary underline font-medium transition-colors"
                >
                  2 - PROCESSO DE CONTRATAÇÃO DE TERCEIROS
                </a>

                <a
                  href="#"
                  className="block text-foreground hover:text-primary underline font-medium transition-colors"
                >
                  3 - RELAÇÕES COM AGENTES PÚBLICOS
                </a>

                <a
                  href="#"
                  className="block text-foreground hover:text-primary underline font-medium transition-colors"
                >
                  4 - PRESENTES E CORTESIAS PARA PARCEIROS COMERCIAIS PRIVADOS
                </a>

                <a
                  href="#"
                  className="block text-foreground hover:text-primary underline font-medium transition-colors"
                >
                  5 - PRESENTES E CORTESIAS OFERECIDOS POR PARCEIROS COMERCIAIS
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-16">
        © Copyright 2025 Aliança Empreendedora - Todos os direitos reservados.
      </footer>
    </div>
  )
}
