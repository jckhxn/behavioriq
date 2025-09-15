import { processPdf } from './pdf'
import { processDocx } from './docx'
import { processExcel } from './excel'
import { processCsv } from './csv'
import { processText } from './text'

export type SupportedFileType = 'pdf' | 'docx' | 'xlsx' | 'xls' | 'csv' | 'txt'

export async function processDocument(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  const type = fileType.toLowerCase() as SupportedFileType

  switch (type) {
    case 'pdf':
      return await processPdf(buffer)
    case 'docx':
      return await processDocx(buffer)
    case 'xlsx':
    case 'xls':
      return await processExcel(buffer)
    case 'csv':
      return await processCsv(buffer)
    case 'txt':
      return await processText(buffer)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

export function getSupportedFileTypes(): SupportedFileType[] {
  return ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt']
}

export function isFileTypeSupported(fileType: string): boolean {
  return getSupportedFileTypes().includes(fileType.toLowerCase() as SupportedFileType)
}