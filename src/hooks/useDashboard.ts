import { useState, useEffect, useCallback, useMemo } from "react"
import { getDashboardResumo, exportarDashboard } from "@/services/dashboardApi"
import type { DashboardResumo, DashboardFilters } from "@/types/dashboard"
import { arrayToCSV, arrayToExcel, downloadFile } from "@/utils/exportHelpers"

interface UseDashboardReturn {
  data: DashboardResumo | null
  loading: boolean
  error: string | null
  refetch: () => void
  exportReport: () => Promise<void>
  exportAsCSV: () => Promise<void>
  exportAsExcel: () => Promise<void>
  exportAsJSON: () => Promise<void>
}

/**
 * Hook customizado para buscar dados do dashboard
 */
export function useDashboard(filters?: DashboardFilters): UseDashboardReturn {
  const [data, setData] = useState<DashboardResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estabiliza o objeto filters para evitar re-renders desnecessários
  const stableFilters = useMemo(() => filters, [
    filters?.groupBy,
    filters?.dataInicio,
    filters?.dataFim,
    filters?.tipoOcorrencia,
    filters?.comiteId,
  ])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getDashboardResumo(stableFilters)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados do dashboard")
      console.error("Erro ao buscar dashboard:", err)
    } finally {
      setLoading(false)
    }
  }, [stableFilters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const exportAsCSV = useCallback(async () => {
    try {
      const resultado = await exportarDashboard()
      if (!resultado.data || resultado.data.length === 0) {
        alert('Nenhum dado para exportar')
        return
      }
      
      const csv = arrayToCSV(resultado.data)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const filename = `relatorio-dashboard-${new Date().toISOString().split("T")[0]}.csv`
      downloadFile(blob, filename)
    } catch (err) {
      console.error("Erro ao exportar CSV:", err)
      alert("Erro ao exportar relatório. Tente novamente.")
    }
  }, [stableFilters])

  const exportAsExcel = useCallback(async () => {
    try {
      const resultado = await exportarDashboard()
      if (!resultado.data || resultado.data.length === 0) {
        alert('Nenhum dado para exportar')
        return
      }
      
      const blob = arrayToExcel(resultado.data, 'Dashboard')
      const filename = `relatorio-dashboard-${new Date().toISOString().split("T")[0]}.xlsx`
      downloadFile(blob, filename)
    } catch (err) {
      console.error("Erro ao exportar Excel:", err)
      alert("Erro ao exportar relatório. Tente novamente.")
    }
  }, [stableFilters])

  const exportAsJSON = useCallback(async () => {
    try {
      const resultado = await exportarDashboard()
      if (!resultado.data || resultado.data.length === 0) {
        alert('Nenhum dado para exportar')
        return
      }
      
      const json = JSON.stringify(resultado, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const filename = `relatorio-dashboard-${new Date().toISOString().split("T")[0]}.json`
      downloadFile(blob, filename)
    } catch (err) {
      console.error("Erro ao exportar JSON:", err)
      alert("Erro ao exportar relatório. Tente novamente.")
    }
  }, [stableFilters])

  const exportReport = exportAsCSV

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    exportReport,
    exportAsCSV,
    exportAsExcel,
    exportAsJSON,
  }
}

