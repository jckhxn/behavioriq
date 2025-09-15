export async function processText(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8')
  } catch (error) {
    console.error('Error processing text file:', error)
    throw new Error('Failed to process text file')
  }
}