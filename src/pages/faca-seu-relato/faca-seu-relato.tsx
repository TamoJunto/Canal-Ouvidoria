import type React from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Value } from "@radix-ui/react-select"
import { c, s } from "vite/dist/node/types.d-aGj9QkWt"

export default function FacaSeuRelato() {
  const navigate = useNavigate()
  const [identificar, setIdentificar] = useState("nao")
  const [evidencias, setEvidencias] = useState("nao")
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [relacao, setRelacao] = useState("")
  const [tipoRelato, setTipoRelato] = useState("")
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [celular, setCelular] = useState("");
  




  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (evidencias === "sim") {
      navigate("/faca-seu-relato/anexos")
    } else {
      navigate("/faca-seu-relato/relatofeito")
    }
  }
  const descricoesRelato: Record<string, string> = {
    "comportamento-inadequado":
      "Ações ou atitudes que fogem dos valores e condutas esperadas em relações estabelecidas com e/ou pela Aliança Empreendedora.",
    "assedio-moral-abuso-poder":
      "Situações em que alguém é exposto(a) a humilhações, intimidações ou uso indevido de autoridade.",
    "conflito-interesses":
      "Quando decisões ou ações pessoais podem interferir nos interesses da organização.",
    "corrupcao":
      "Práticas que envolvem favorecimento indevido, suborno, fraude ou uso indevido de recursos.",
    "assedio-sexual":
      "Avanços, comentários ou atitudes de cunho sexual sem consentimento, que causem constrangimento.",
    "preconceito-discriminacao":
      "Tratamento desigual ou ofensivo baseado em gênero, raça, idade, religião, orientação sexual, deficiência ou outras características pessoais.",
    "outros":
      "Situações não contempladas nas categorias anteriores, mas que você considera importante relatar."
  }



  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex flex-col items-center px-4 py-12 md:py-16">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">Faça seu Relato</h1>

          <div className="bg-primary rounded-3xl p-8 md:p-12 relative">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identificação */}
              <div className="space-y-3">
                <Label className="text-white text-base font-medium">Você gostaria de se identificar?</Label>
                <RadioGroup value={identificar} onValueChange={setIdentificar} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="sim" className="border-white text-white" />
                    <Label htmlFor="sim" className="text-white text-base cursor-pointer">
                      Sim
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="nao" className="border-white text-white" />
                    <Label htmlFor="nao" className="text-white text-base cursor-pointer">
                      Não
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {identificar === "sim" && (
                <>
                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">Nome Completo</Label>
                    <Input type="text"  
                    placeholder="Ex: João Silva" 
                    className="bg-white border-0 text-foreground" 
                    required />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">CPF</Label>
                    <Input
                      type="text"
                      placeholder="Ex: 000.000.000-00"
                      value={cpf}
                      onChange={(e) =>{
                        let v = e.target.value.replace(/\D/g, '');
                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                        v = v.replace(/(\d{3})(\d{1,2})$/, '$1.$2');
                        setCpf(v);
                      }}
                      maxLength={14}
                      className="bg-white border-0 text-foreground"
                      required

                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">E-mail</Label>
                    <Input
                      type="email"
                      placeholder="exemplo@exemplo.com"
                      className="bg-white border-0 text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">Data de Nascimento</Label>
                    <Input type="text" 
                    placeholder="DD/MM/ANO" 
                    value={dataNascimento}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '');
                      v = v.replace(/(\d{2})(\d)/, '$1/$2');
                      v = v.replace(/(\d{2})(\d)/, '$1/$2');
                      setDataNascimento(v);
                    }}
                    maxLength={10}
                    className="bg-white border-0 text-foreground"
                     required />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">Celular</Label>
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={celular}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        v = v.replace(/(\d{2})(\d)/, '($1) $2');
                        v = v.replace(/(\d{5})(\d)/, '$1-$2');
                        setCelular(v);
                      }}
                      className="bg-white border-0 text-foreground"
                      required
                    />
                  </div>
                </>
              )}

              {identificar === "nao" && (
                <>
                  <div className="space-y-4 text-white text-sm leading-relaxed">
                    <p>
                      Conflito de interesses, contratação de parentes, favorecimento, doações e
                      hospitalidades(presentes, brindes, ingressos, eventos, refeições e viagens)
                    </p>
                    <p>
                      É vedado a qualquer integrante usar a visibilidade ou o prestígio do Grupo Globo, assim como seu
                      cargo ou função para influenciar alguém ou obter vantagens ou benefícios indevidos, sejam
                      patrimoniais ou de outra natureza.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white text-sm font-medium">E-mail</Label>
                    <Input
                      type="email"
                      placeholder="exemplo@exemplo.com"
                      className="bg-white border-0 text-foreground"
                      required
                    />
                  </div>
                </>
              )}

              {/* Relação com AE */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium">Qual a sua relação com a Aliança Empreendedora?</Label>
                <Select value={relacao} onValueChange={setRelacao}>
                  <SelectTrigger className="bg-white border-0 text-foreground">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipe">Equipe</SelectItem>
                    <SelectItem value="empreendedor">Empreendedor</SelectItem>
                    <SelectItem value="parceiro">Organização parceira</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor</SelectItem>
                    <SelectItem value="voluntario">Voluntário</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                    <SelectItem value="nao-quero-informar">Não quero informar</SelectItem>
                  </SelectContent>
                </Select>

                {relacao === "outros" && (
                  <div className="space-y-3">
                    <label className="text-white text-sm font-medium">Informe sua relação com a AE</label>
                    <Input type="text" 
                    placeholder="Descreva sua relação" 
                    className="bg-white border-0 text-foreground" onChange={(e)=> console.log(e.target.value)} />
                  </div>
                  )}
              
              </div>

              {/* Tipo de Relato */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium">Tipo de Relatos que se Refere</Label>
                <Select value={tipoRelato} onValueChange={setTipoRelato}>
                  <SelectTrigger className="bg-white border-0 text-foreground">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comportamento-inadequado">Comportamento inadequado</SelectItem>
                    <SelectItem value="assedio-moral-abuso-poder">Assédio moral e/ou abuso de poder</SelectItem>
                    <SelectItem value="conflito-interesses">Conflito de interesses</SelectItem>
                    <SelectItem value="corrupcao">Corrupção</SelectItem>
                    <SelectItem value="assedio-sexual">Assédio sexual</SelectItem>
                    <SelectItem value="preconceito-discriminacao">Preconceito e discriminação</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>

                  {tipoRelato && (
                    <p className="text-white text-sm font-medium">
                      {descricoesRelato[tipoRelato]}
                    </p>
                  )}

                  {tipoRelato === "outros" && (
                  <div className="space-y-3">
                    <label className="text-white text-sm font-medium">Informe o tipo de relato</label>
                    <Input type="text" 
                    placeholder="Descreva o tipo de relato" 
                    className="bg-white border-0 text-foreground" onChange={(e)=> console.log(e.target.value)} />
                  </div>
                  )}

              </div>

              {/* Descrição do Relato */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium">Sobre o que você gostaria de falar/relatar?</Label>
                <Textarea
                  placeholder="Descreva a sua denúncia de forma clara e direta..."
                  className="bg-white border-0 text-foreground min-h-[100px] resize-none"
                  required
                />
              </div>

              {/* Pessoas Envolvidas */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium">Quem são as pessoas e/ou empresas envolvidas?</Label>
                <Textarea
                  placeholder="Descreva a sua denúncia de forma clara e direta..."
                  className="bg-white border-0 text-foreground min-h-[100px] resize-none"
                  required
                />
              </div>

              {/* Evidências */}
              <div className="space-y-3">
                <Label className="text-white text-base font-medium">Possui evidências?</Label>
                <RadioGroup value={evidencias} onValueChange={setEvidencias} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="evidencias-sim" className="border-white text-white" />
                    <Label htmlFor="evidencias-sim" className="text-white text-base cursor-pointer">
                      Sim
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="evidencias-nao" className="border-white text-white" />
                    <Label htmlFor="evidencias-nao" className="text-white text-base cursor-pointer">
                      Não
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Conhecimento dos Fatos */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium">
                  Além de você, quem mais tem conhecimento dos fatos?;
                </Label>
                <Textarea
                  placeholder="Descreva a sua denúncia de forma clara e direta..."
                  className="bg-white border-0 text-foreground min-h-[80px] resize-none"
                />
              </div>

              {/* LGPD */}
              <div className="border-2 border-white rounded-2xl p-6 space-y-4">
                <p className="text-white text-xs leading-relaxed">
                  Os dados pessoais fornecidos acima serão utilizados pela Aliança Empreendedora estritamente para fins
                  de apuração do relato apresentado. Todos os dados pessoais por ventura coletados serão tratados pela
                  Aliança Empreendedora, seguindo rígidos padrões de segurança da informação e em conformidade com a
                  legislação aplicável, em especial a Lei Geral de Proteção de Dados Pessoais – Lei 13.709/2018, a Lei
                  Geral de Proteção de Dados – (LGPD). Você poderá exercer os direitos previstos na LGPD, como
                  confirmação, acesso e correção de seus dados pessoais, por meio do email{" "}
                  <button type="button" onClick={() => setShowLgpdModal(true)} className="underline hover:text-accent">
                    lgpd@aliancaempreendedora.org.br
                  </button>
                  . E um box "Li e concordo com o termo acima
                </p>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="lgpd"
                    checked={lgpdAccepted}
                    onCheckedChange={(checked) => setLgpdAccepted(checked as boolean)}
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-white mt-1"
                    required
                  />
                  <Label htmlFor="lgpd" className="text-white text-sm cursor-pointer leading-relaxed">
                    LGPD
                  </Label>
                </div>
              </div>

              {/* Botão Prosseguir */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  type="submit"
                  className="bg-white hover:bg-white/90 text-primary font-semibold uppercase tracking-wide px-12 py-6"
                >
                  Prosseguir
                </Button>

                <span className="text-white text-4xl font-light">1</span>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Dialog open={showLgpdModal} onOpenChange={setShowLgpdModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-primary text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-accent">Política de proteção de dados</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-sm leading-relaxed">
            <p>
              O responsável pelo tratamento de dados pessoais, com finalidade de gerenciar a denúncia apresentada
              referente a irregularidades relacionadas às políticas, códigos e normativas de atuação corporativas
              definidas pela Aliança Empreendedora, será a própria Aliança Empreendedora, podendo compartilhar as
              informações apenas com as áreas internas necessárias para a apuração da denúncia. Serão considerados os
              direitos e preceitos estabelecidos pela LGPD.
            </p>

            <div>
              <h3 className="font-bold text-lg mb-2">
                1. Quem é o responsável pelo tratamento dos seus dados pessoais?
              </h3>
              <p>
                A Aliança Empreendedora, uma organização com sede em Curitiba – PR, é a responsável pelo tratamento dos
                dados pessoais recebidos através do canal de denúncias interno (doravante, o "Canal").
              </p>
              <p className="mt-2">
                A Aliança Empreendedora respeita os direitos e liberdades fundamentais das pessoas, entre os quais o
                direito à proteção de dados pessoais. A privacidade dos(as) denunciantes, denunciados(as) e testemunhas
                é um pilar básico para a organização, que trata seus dados pessoais com extremo respeito à legislação
                vigente em matéria de proteção de dados pessoais, privacidade e segurança dessas informações. Para isso,
                são adotadas medidas técnicas e organizacionais necessárias para evitar a perda, o uso indevido,
                alteração, acesso não autorizado e subtração de dados pessoais fornecidos, levando-se em conta o estado
                da tecnologia, a natureza dos dados e os riscos a que eles estão expostos.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">2. Para que tratamos seus dados pessoais?</h3>
              <p>
                Seus dados pessoais são tratados pela Aliança Empreendedora para gerenciar e analisar denúncias enviadas
                por meio do Canal relativas a irregularidades com relação às políticas, códigos e normativas de
                organização.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
