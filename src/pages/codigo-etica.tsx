import { ConditionalHeader } from "@/components/ConditionalHeader"

export default function CodigoDeEtica() {
  return (
    <div className="min-h-screen bg-background">
      <ConditionalHeader />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Código de Ética e Conduta</h1>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p>Aqui você encontra o Código de Ética e Conduta da Aliança Empreendedora na íntegra.</p>

              <p>
                Ele reúne as diretrizes e normas de conduta que orientam nosso comportamento cotidiano, e também os
                cuidados que devemos ter ao desenvolvermos nossas atividades e nos relacionarmos com outros
                profissionais e organizações
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-8 min-h-[400px] flex items-center justify-center">
            
          <iframe
              src="https://associacaoaliancae.sharepoint.com/sites/AssembleiaGeralAE/_layouts/15/embed.aspx?UniqueId=8ce7d9d2-0395-4d5c-ae01-8a5abbc1c762"
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              title="Código de Conduta AE"
              className="rounded-lg shadow-lg"
            ></iframe>

          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-16">
        © Copyright 2025 Aliança Empreendedora - Todos os direitos reservados.
      </footer>
    </div>
  )
}
