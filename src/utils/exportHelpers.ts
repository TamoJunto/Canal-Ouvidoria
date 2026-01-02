import * as XLSX from 'xlsx';

/**
 * Converte array de objetos para CSV
 */
export function arrayToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Adiciona headers
  csvRows.push(headers.join(','));
  
  // Adiciona dados
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escapa aspas e adiciona entre aspas
      const escaped = String(val !== null && val !== undefined ? val : '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Converte array de objetos para Excel (XLSX)
 */
export function arrayToExcel(data: any[], sheetName: string = 'Dados'): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Gera arquivo
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

/**
 * Faz download de um arquivo
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

