import { ConditionalHeader } from "@/components/ConditionalHeader"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function DuvidasFrequentes() {
  return (
    <div className="min-h-screen bg-background">
      <ConditionalHeader />

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="space-y-12">
          {/* Introdução */}
          <section className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Conheça a Ouvidoria</h1>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                A Ouvidoria da Aliança Empreendedora é um canal de comunicação para que os nossos funcionários e
                parceiros possam esclarecer suas dúvidas e relatar questões que acreditem estar em desacordo com nosso
                compromisso ético, de forma que possamos tomar conhecimento e atuar no que for necessário.
              </p>

              <p>
                Independência, confidencialidade e segurança são os principais pilares da Ouvidoria da Aliança
                Empreendedora para que todos possam se manifestar de forma livre e responsável.
              </p>

              <p>
                Disponível 24 horas por dia, 7 dias por semana através deste website, a Ouvidoria pode ser acessada de
                qualquer local com internet.
              </p>
            </div>
          </section>

          {/* Saiba mais sobre a Ouvidoria */}
          <section className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Saiba mais sobre a Ouvidoria!</h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary">
                  Por que a Aliança criou a Ouvidoria?
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  A Ouvidoria foi criada para fortalecer os canais de comunicação da organização e garantir que todos os
                  colaboradores, parceiros e stakeholders possam reportar questões éticas de forma segura e
                  confidencial.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  Este canal é realmente seguro e confidencial?
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  Sim, o canal é totalmente seguro e confidencial. Utilizamos tecnologia de ponta para proteger sua
                  identidade e suas informações.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  Quando eu devo utilizar a Ouvidoria?
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  Você deve utilizar a Ouvidoria sempre que tiver dúvidas ou quiser relatar situações que possam estar
                  em desacordo com nossos valores e código de ética.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  Preciso ter provas para fazer um relato?
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  Não é necessário ter provas, mas quanto mais informações você puder fornecer, melhor será a
                  investigação e resolução do caso.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  O que é importante ter no meu relato?
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  É importante descrever a situação de forma clara e objetiva, informando o que aconteceu, quando, onde,
                  quem estava envolvido e qualquer outra informação relevante.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Comissão de Ética e Conduta */}
          <section className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Comissão de Ética e Conduta</h2>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                A Comissão de Ética e Conduta foi criada para dar agilidade na avaliação e respostas às manifestações
                recebidas pela Ouvidoria da Aliança Empreendedora e tem sua agenda totalmente focada em dilemas que
                envolvam a ética e a conduta, sendo responsável por:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Promover a disseminação das diretrizes de conduta da Aliança Empreendedora;</li>
                <li>Garantir o funcionamento da Ouvidoria, a confidencialidade e respostas aos relatos recebidos;</li>
                <li>Esclarecer os dilemas éticos e dúvidas de interpretação do Código de Ética e Conduta;</li>
                <li>Analisar os riscos percebidos e recomendar as ações necessárias;</li>
                <li>Avaliar os casos de violações ao Código, elaborar pareceres e deliberar sobre o tema.</li>
              </ul>

              <p>
                Formada por membros da Alta Administração da Aliança Empreendedora, a Comissão de Ética e Conduta está
                subordinada ao Comitê de Auditoria e Compliance que responde diretamente ao Conselho de Administração da
                Aliança Empreendedora.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
