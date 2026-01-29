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
                O documento reúne as diretrizes e normas que orientam nosso comportamento cotidiano, assim como os 
                cuidados e boas práticas essenciais para a realização de nossas atividades e para nossos relacionamentos com 
                outras pessoas e organizações.
              </p>
              <p> 
                Ele reflete os valores que sustentam nossa atuação e reforça o compromisso da Aliança Empreendedora com ética,
                transparência, respeito e promoção da diversidade em todas as nossas iniciativas. 
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-8 min-h-[400px] flex items-center justify-center">
            
          <iframe
              src="https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/Codigo_de_Conduta_Alianca_Empreendedora_e58cb5dabd.pdf"
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
