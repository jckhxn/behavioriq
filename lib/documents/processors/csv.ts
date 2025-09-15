import Papa from 'papaparse'

export async function processCsv(buffer: Buffer): Promise<string> {
  try {
    const text = buffer.toString('utf-8')
    const parsed = Papa.parse(text, { header: true })
    
    if (parsed.errors.length > 0) {
      console.warn('CSV parsing warnings:', parsed.errors)
    }
    
    // Convert back to a more readable format
    let result = ''
    if (parsed.data.length > 0) {
      const headers = Object.keys(parsed.data[0] as object)
      result += headers.join(', ') + '\n'
      
      parsed.data.forEach((row: any) => {
        const values = headers.map(header => row[header] || '')
        result += values.join(', ') + '\n'
      })
    }
    
    return result
  } catch (error) {
    console.error('Error processing CSV:', error)
    throw new Error('Failed to process CSV file')
  }
}