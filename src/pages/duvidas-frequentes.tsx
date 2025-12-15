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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Conheça o Canal de Relatos</h1>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                O Canal de Relatos é um espaço seguro de escuta da Aliança Empreendedora. Aqui, equipe, parceiros, voluntários, fornecedores, participantes e qualquer pessoa que se relacione com nossas iniciativas pode esclarecer dúvidas ou relatar situações que estejam em desacordo com nosso compromisso ético, com a defesa dos direitos humanos e com a promoção da igualdade. Esse canal nos ajuda a identificar questões importantes e agir quando necessário. 
              </p>

              <p>
                Independência, confidencialidade e segurança são pilares fundamentais do Canal de Relatos, garantindo que todas as pessoas possam se manifestar com liberdade, responsabilidade e acolhimento. 
              </p>

              <p>
                Disponível de forma online neste portal, o canal pode ser acessado por toda a comunidade, a qualquer dia e horário. 
              </p>
            </div>
          </section>

          {/* Saiba mais sobre a Ouvidoria */}
          <section className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Dúvidas frequentes:</h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-0 border-primary">
                
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  Por que a Aliança Empreendedora criou o Canal de Relatos? 
                </AccordionTrigger>
               
                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  O Canal de Relatos foi criado para reforçar nossas políticas de compliance, 
                  diversidade e inclusão, garantindo que toda a equipe, parceiros, empreendedores e 
                  demais stakeholders possam reportar questões éticas de forma segura e confidencial. Assim, fortalecemos um fluxo de 
                  comunicação alinhado às boas práticas de transparência e responsabilidade social da organização. 
                <br />
                <br />
                  Este é um espaço essencial para a formalização de denúncias, bem como para o registro e o acompanhamento das etapas de investigação. 
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  Este Canal é realmente seguro e confidencial?
                </AccordionTrigger>

                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  Sim. O Canal de Relatos é totalmente seguro e confidencial. Utilizamos tecnologia avançada para proteger
                 sua identidade e todas as informações enviadas, em conformidade com a LGPD (Lei Geral de Proteção de Dados) 
                  e com procedimentos internos robustos, conduzidos pelo Comissão de Ética e pelo Comitê de Diversidade. 
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  Quando eu devo utilizar o Canal de Relatos? 
                </AccordionTrigger>

                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  Você pode utilizar o Canal de Relatos sempre que tiver dúvidas ou desejar comunicar situações que possam estar 
                  em desacordo com nossos valores, nossas políticas ou nosso Código de Ética. Este espaço existe para garantir que 
                  qualquer pessoa possa compartilhar preocupações de forma segura e responsável. 
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  Preciso ter provas para fazer um relato? 
                </AccordionTrigger>

                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  Não é obrigatório apresentar provas para registrar um relato. Porém, quanto mais informações você puder fornecer — como detalhes, 
                  documentos ou evidências que ajudem a entender a situação — mais completo e efetivo será o processo de análise e investigação. 
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-0 border-primary">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary underline">
                  O que é importante ter no meu relato? 
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pt-4">
                  É importante descrever a situação de forma detalhada e objetiva, informando o que aconteceu, quando, onde, 
                  quem estava envolvido e qualquer outra informação que considere relevante. 
                  Sempre que possível, anexe também evidências e deixe seus dados de contato. 
                  <br />
                  <br />
                  Essas informações não são obrigatórias, mas ajudam a tornar o processo de investigação 
                  mais completo e facilitam a conclusão do caso e de suas possíveis consequências. 
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Comissão de Ética e Conduta */}
          <section className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Comissão de Ética e Conduta</h2>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                A Comissão de Ética e Conduta é formada por representantes do grupo de 
                Associados da Aliança Empreendedora e tem como propósito garantir que nossos princípios éticos sejam 
                vividos no dia a dia da organização. 
              </p>
              <p>
                O grupo atua de forma independente e imparcial, assegurando que todas as manifestações 
                recebidas pelo Canal de Relatos sejam avaliadas com seriedade, acolhimento e responsabilidade.
              </p>
              <p>
              A Comissão é acionada sempre que chegam relatos envolvendo questões éticas, conduta ou possíveis violações às
               políticas da organização. Entre suas responsabilidades, estão:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Garantir o funcionamento adequado do Canal de Relatos, 
                  assegurando confidencialidade, cuidado e retorno às manifestações enviadas;</li>
                <li>Esclarecer dilemas éticos e apoiar a interpretação do Código de Ética e Conduta;</li>
                <li>Analisar riscos identificados nos relatos e recomendar ações preventivas ou corretivas;</li>
                <li>Avaliar possíveis violações ao Código, elaborar pareceres técnicos e deliberar sobre os encaminhamentos necessários</li>
              </ul>

              <p>
                Os membros da Comissão são indicados e eleitos conforme a necessidade de análise de cada relato, 
                em um formato que garante confidencialidade, imparcialidade e previne conflitos de interesse. 
              </p>
              <p>
                A Comissão atua com autonomia em relação às demais áreas da organização, assegurando independência nas análises. 
              </p>

              <p>Os relatos são avaliados seguindo um fluxo interno que inclui análise, apuração e retorno, 
                sempre com rigor, sigilo e segurança das informações. </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
