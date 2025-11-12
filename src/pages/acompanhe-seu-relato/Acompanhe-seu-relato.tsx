import type React from "react"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

export default function AcompanheSeuRelato() {
  const [protocolo, setProtocolo] = useState("")
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (protocolo) {
      setShowResults(true)
    }
  }

  const clearSearch = () => {
    setProtocolo("")
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex flex-col items-center px-4 py-12 md:py-16">
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">Acompanhe Seu Relato</h1>

          <div className="bg-primary rounded-3xl p-8 md:p-12 min-h-[500px]">
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Digite o Protocolo"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                  className="bg-white border-0 text-foreground pr-12 py-6 text-base"
                />
                {protocolo && (
                  <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                {!protocolo && (
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </form>

            {showResults && (
              <div className="space-y-8 text-white">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Minha Reclamação</h2>
                  <p className="text-sm leading-relaxed">
                    Relato Aleatório
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Resposta</h3>
                  <p className="text-sm leading-relaxed mb-6">
                    Relato Aleatório
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Resposta</h3>
                  <Textarea placeholder="" className="bg-white border-0 text-foreground min-h-[120px] resize-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
