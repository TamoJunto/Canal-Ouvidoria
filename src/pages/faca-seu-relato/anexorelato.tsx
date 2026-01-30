import type React from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Loader2 } from "lucide-react"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { relatosPublicApi } from "@/services"

export default function AnexosPage() {
  const [anexos, setAnexos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const locationState = location.state as { 
    protocol?: string; 
    naoSeIdentificou?: boolean;
    receberProtocoloPorEmail?: boolean;
  } | undefined
  
  const protocol = locationState?.protocol
  const naoSeIdentificou = locationState?.naoSeIdentificou || false
  const receberProtocoloPorEmail = locationState?.receberProtocoloPorEmail || false

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setAnexos([...anexos, ...Array.from(e.target.files)]);
      }
  };

  const removeFile = (index: number) => {
      setAnexos(anexos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!protocol) {
      alert('Protocolo não encontrado. Por favor, crie o relato novamente.')
      navigate('/faca-seu-relato')
      return
    }
    
    // Se tem anexos, faz upload
    if (anexos.length > 0) {
      setLoading(true)
      try {
        await relatosPublicApi.uploadAnexos(protocol, anexos)
        console.log('Anexos enviados com sucesso!')
      } catch (error: any) {
        console.error('Erro ao enviar anexos:', error)
        alert(error.response?.data?.message || 'Erro ao enviar anexos. Prosseguindo...')
      } finally {
        setLoading(false)
      }
    }
    
    navigate("/faca-seu-relato/relatofeito", { 
      state: { 
        protocol,
        naoSeIdentificou,
        receberProtocoloPorEmail
      } 
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex flex-col items-center px-4 py-12 md:py-16">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">Anexos</h1>

          <form onSubmit={handleSubmit}>
            <div className="bg-primary rounded-3xl p-8 md:p-12 relative min-h-[300px] flex flex-col">
              <div className="flex-1 space-y-6">
                <div className=" gap-4 mb-4">
                  <div className="border-2 border-dashed border-muted rounded-xl p-6 text-center">
                    <Upload className="mx-auto mb-2 text-white" size={40} />
                    <p className="text-white text-sm mb-4 houv">
                      Arraste e Solte um arquivo ou clique para selecionar
                    </p>

                    <div className="bg-white/10 rounded-lg p-4 mb-4">
                      <p className="text-white text-sm">Formatos aceitos:</p>
                      <p className="text-white text-xs">PDF, JPG, JPEG, PNG, MP4, M4V, AVI, MPG, MPEG, GIF, TIF, MP3, WAV, M4A, OPUS e OGG</p>
                      <p className="text-white/90 text-xs font-medium mb-1">Limites:</p>
                      <p className="text-white/70 text-xs">
                        • Tamanho máximo por arquivo: <strong className="text-white">25MB</strong><br />
                        • Máximo de arquivos: <strong className="text-white">10 arquivos</strong><br />
                        • Tamanho total máximo: <strong className="text-white">100MB</strong>
                      </p>
                    </div>

                    <input type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.mp4,.m4v,.avi,.mpg,.mpeg,.gif,.tif,.mp3,.wav,.m4a,.opus,.ogg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer bg-primary text-white px-4 py-2 rounded houver:bg-primary/90">
                    Selecione um arquivo
                    </label>
                  </div>

                  {anexos.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Arquivos anexados:</h3>
                      {anexos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

            <div className="flex items-center justify-between pt-4 mt-auto">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-accent hover:bg-accent/90 text-primary font-semibold uppercase tracking-wide px-4 py-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Prosseguir'
                  )}
                </Button>

              <span className="text-white text-4xl font-light">2</span>
            </div>
            </div>
          </div>
          </form>
        </div>
      </main>
    </div>
  )
}
