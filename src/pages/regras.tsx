import { ConditionalHeader } from "@/components/ConditionalHeader"
import { ExternalLink } from "lucide-react"

const topicos = [
  {
    id: 1,
    titulo: "POLÍTICA ANTICORRUPÇÃO - CONCEITO GERAL",
    link: "https://associacaoaliancae.sharepoint.com/sites/AssembleiaGeralAE/Documentos%20Compartilhados/Forms/AllItems.aspx?viewid=c6b908ea%2Dcc29%2D4702%2Dacb0%2D427615aefe17&ga=1&id=%2Fsites%2FAssembleiaGeralAE%2FDocumentos%20Compartilhados%2FGeneral%2F01%2E%20Gest%C3%A3o%2FRegimento%20interno%20e%20pol%C3%ADticas%2FPoliticas%20internas%20base%20RI%2FPol%C3%ADticas%20%2D%20Diagramadas%2FPOL%C3%8DTICA%20ANTICORRUP%C3%87%C3%83O%20DA%20ASSOCIA%C3%87%C3%83O%20%20ALIAN%C3%87A%20EMPREENDEDORA%2Epdf&parent=%2Fsites%2FAssembleiaGeralAE%2FDocumentos%20Compartilhados%2FGeneral%2F01%2E%20Gest%C3%A3o%2FRegimento%20interno%20e%20pol%C3%ADticas%2FPoliticas%20internas%20base%20RI%2FPol%C3%ADticas%20%2D%20Diagramadas",
    thumbnail: ""
  },
  {
    id: 2,
    titulo: "PROCESSO DE CONTRATAÇÃO DE TERCEIROS",
    link: "https://exemplo.com/contratacao-terceiros.pdf",
    thumbnail: "https://crbasso.com.br/wp-content/uploads/2022/07/Principais-cuidados-nos-processos-de-contratacao-de-terceiros-atualizado-pela-Lei-da-Terceirizacao.jpg"
  },
  {
    id: 3,
    titulo: "RELAÇÕES COM AGENTES PÚBLICOS",
    link: "https://lec.com.br/relacionamento-entre-agentes-publicos-e-a-iniciativa-privada/",
    thumbnail: "https://lec.com.br/wp-content/uploads/2024/01/senhora-do-escritorio-focada-em-copos-usando-tablet-enquanto-dois-empresarios-maduros-discutindo-o-trabalho-atras-da-parede-de-vidro-copie-o-espaco-conceito-de-comunicacao-1-2048x1365.jpg"
  },
  {
    id: 4,
    link: "https://associacaoaliancae.sharepoint.com/sites/AssembleiaGeralAE/Documentos%20Compartilhados/Forms/AllItems.aspx?id=%2Fsites%2FAssembleiaGeralAE%2FDocumentos%20Compartilhados%2FGeneral%2F01%2E%20Gest%C3%A3o%2FRegimento%20interno%20e%20pol%C3%ADticas%2FPoliticas%20internas%20base%20RI%2FPol%C3%ADticas%20%2D%20Diagramadas%2FPOL%C3%8DTICA%20DE%20CORTESIAS%20DA%20ASSOCIA%C3%87%C3%83O%20ALIAN%C3%87A%20EMPREENDEDORA%20%2Epdf&parent=%2Fsites%2FAssembleiaGeralAE%2FDocumentos%20Compartilhados%2FGeneral%2F01%2E%20Gest%C3%A3o%2FRegimento%20interno%20e%20pol%C3%ADticas%2FPoliticas%20internas%20base%20RI%2FPol%C3%ADticas%20%2D%20Diagramadas",
    thumbnail: "https://claglobal.com.br/wp-content/uploads/2024/12/close-up-unrecognizable-man-giving-gift-box-camera-scaled.jpg",
    titulo: "PRESENTES E CORTESIAS PARA PARCEIROS COMERCIAIS PRIVADOS",
  },
  {
    id: 5,
    titulo: "PRESENTES E CORTESIAS OFERECIDOS POR PARCEIROS COMERCIAIS",
    link: "https://associacaoaliancae.sharepoint.com/sites/AssembleiaGeralAE/Documentos%20Compartilhados/Forms/AllItems.aspx?id=%2Fsites%2FAssembleiaGeralAE%2FDocumentos%20Compartilhados%2FGeneral%2F01%2E%20Gest%C3%A3o%2FRegimento%20interno%20e%20pol%C3%ADticas%2FPoliticas%20internas%20base%20RI%2FPol%C3%ADticas%20%2D%20Diagramadas%2FPOL%C3%8DTICA%20DE%20CORTESIAS%20DA%20ASSOCIA%C3%87%C3%83O%20ALIAN%C3%87A%20EMPREENDEDORA%20%2Epdf&parent=%2Fsites%2FAssembleiaGeralAE%2FDocumentos%20Compartilhados%2FGeneral%2F01%2E%20Gest%C3%A3o%2FRegimento%20interno%20e%20pol%C3%ADticas%2FPoliticas%20internas%20base%20RI%2FPol%C3%ADticas%20%2D%20Diagramadas",
    thumbnail: "https://claglobal.com.br/wp-content/uploads/2024/12/close-up-unrecognizable-man-giving-gift-box-camera-scaled.jpg"
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
