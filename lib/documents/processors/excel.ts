import * as XLSX from 'xlsx'

export async function processExcel(buffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    let text = ''
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      const sheetData = XLSX.utils.sheet_to_csv(worksheet)
      text += `Sheet: ${sheetName}\n${sheetData}\n\n`
    })
    
    return text
  } catch (error) {
    console.error('Error processing Excel:', error)
    throw new Error('Failed to process Excel file')
  }
}