import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar, BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { name: "Seg", valor1: 60, valor2: 80 },
  { name: "Ter", valor1: 40, valor2: 25 },
  { name: "Qua", valor1: 70, valor2: 40 },
  { name: "Qui", valor1: 60, valor2: 25 },
  { name: "Sex", valor1: 40, valor2: 60 },
  { name: "Sáb", valor1: 30, valor2: 20 },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />
      <main className="flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-7xl">
          <div className="bg-primary rounded-t-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <div className="flex gap-4">
                <Button className="bg-white hover:bg-white/90 text-primary gap-2">
                  <Download className="h-4 w-4" />
                  Baixar Relatório
                  <span className="text-xs text-muted-foreground block">Periodo</span>
                </Button>
                <Button className="bg-white hover:bg-white/90 text-primary gap-2">
                  <Calendar className="h-4 w-4" />
                  Filtro Periodo
                  <span className="text-xs text-muted-foreground block">15 Maio 2025 - 26 Jun 2025</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">95</div>
                    <div className="text-sm text-muted-foreground mt-1">Total de Relatos</div>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <TrendingUp className="h-3 w-3" />
                      4% (30 dias)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">35</div>
                    <div className="text-sm text-muted-foreground mt-1">Novos</div>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <TrendingUp className="h-3 w-3" />
                      4% (30 dias)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">40</div>
                    <div className="text-sm text-muted-foreground mt-1">Em Andamento</div>
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-2">
                      <TrendingDown className="h-3 w-3" />
                      25% (30 dias)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">20</div>
                    <div className="text-sm text-muted-foreground mt-1">Finalizados</div>
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-2">
                      <TrendingDown className="h-3 w-3" />
                      12% (30 dias)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-b-3xl p-8 border-4 border-t-0 border-primary">
            <div className="bg-white rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gráfico</h2>
                <Select defaultValue="semana">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Semana</SelectItem>
                    <SelectItem value="mes">Mês</SelectItem>
                    <SelectItem value="ano">Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor1" fill="#EAB308" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="valor2" fill="#F87171" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
