import { ConditionalHeader } from "@/components/ConditionalHeader"
import { ExternalLink } from "lucide-react"

const topicos = [
  
  {
    id: 1,
    titulo: "POLÍTICA DE CORTESIAS",
    link: "https://aliancaempreendedora.org.br/wp-content/uploads/2025/12/POL%C3%8DTICA%20DE%20CORTESIAS%20DA%20ASSOCIA%C3%87%C3%83O%20ALIAN%C3%87A%20EMPREENDEDORA%20.pdf?_t=1765342389",
    thumbnail: "https://prod-cms-us-east-1-https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/1_dae0517a05.png"
  },
  {
    id: 2,
    titulo: "POLÍTICA ANTICORRUPÇÃO",
    link: "https://aliancaempreendedora.org.br/wp-content/uploads/2025/12/POL%C3%8DTICA%20ANTICORRUP%C3%87%C3%83O%20DA%20ASSOCIA%C3%87%C3%83O%20%20ALIAN%C3%87A%20EMPREENDEDORA.pdf?_t=1765342389",
    thumbnail: "https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/2_a570ddacb3.png"
  },
  {
    id: 3,
    titulo: "POLÍTICA DE DOAÇÕES E PATROCÍNIOS",
    link: "https://aliancaempreendedora.org.br/wp-content/uploads/2025/12/POL%C3%8DTICA%20DE%20DOA%C3%87%C3%95ES%20E%20PATROC%C3%8DNIOS%20DA%20ASSOCIA%C3%87%C3%83O%20ALIAN%C3%87A%20EMPREENDEDORA.pdf?_t=1765342389",
    thumbnail: "https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/3_a36d47af54.png"
  },
  {
    id: 4,
    titulo: "POLÍTICA DE CONFLITO DE INTERESSES",
    link: "https://aliancaempreendedora.org.br/wp-content/uploads/2025/12/POL%C3%8DTICA%20DE%20CONFLITO%20DE%20INTERESSES%20DA%20ASSOCIA%C3%87%C3%83O%20ALIAN%C3%87A%20EMPREENDEDORA%20.pdf?_t=1765342389",
    thumbnail: "https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/4_eeeb61d91f.png"
  },
  {
    id: 5,
    titulo: "POLÍTICA DE PROTEÇÃO",
    link: "https://aliancaempreendedora.org.br/wp-content/uploads/2025/12/POL%C3%8DTICA%20DE%20PROTE%C3%87%C3%83O%20%28SAFEGUARDING%20POLICY%29.pdf?_t=1765342389",
    thumbnail: "https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/5_2b4f612af8.png",
  },
  {
    id: 6,
    titulo: "SAFEGUARDING POLICY",
    link: "https://aliancaempreendedora.org.br/wp-content/uploads/2025/12/SAFEGUARDING%20POLICY_ENGLISH.pdf?_t=1765342389",
    thumbnail: "https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/6_360a59ad6b.png"
  },
  {
    id: 7,
    titulo: "CONSEQUÊNCIAS",
    link: "https://aliancaempreendedora.org.br/wp-content/uploads/2025/12/CONSEQU%C3%8ANCIAS.pdf?_t=1765342389",
    thumbnail: "https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/7_d451defbf0.png"
  }

]

export default function Regras() {
  return (
    <div className="min-h-screen bg-background">
      <ConditionalHeader />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Políticas de Integridade</h1>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p>Nesta seção você encontra as Políticas de Integridade da Aliança Empreendedora, 
                que orientam nossas práticas internas e nossos relacionamentos institucionais.</p>

            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Clique nos tópicos abaixo para conhecer cada política:</h2>
            <h2 className="text-2xl font-bold text-foreground">Introdução</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topicos.map((topico) => (
                <div key={topico.id} className="space-y-4">
                  <a
                    href={topico.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-primary transition-all hover:shadow-lg"
                  >
                    <img
                      src={topico.thumbnail}
                      alt={topico.titulo}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  <h3 className="text-lg font-bold text-foreground">
                    {topico.id} - {topico.titulo}
                  </h3>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center z-10">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg z-10">
                        <ExternalLink className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
          <br />
          <div className="space-y-6">
            <p className="text-sm text-foreground text-center">Para mais informações ou dúvidas, entre em contato pelo e-mail: falecom@aliancaempreendedora.org.br </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-16">
        © Copyright 2025 Aliança Empreendedora - Todos os direitos reservados.
      </footer>
    </div>
  )
}
