import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { deleteDocumentEmbeddings } from '@/lib/documents/embeddings'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = params.id

    // Verify document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete embeddings first
    await deleteDocumentEmbeddings(documentId)

    // Delete document (cascades to chunks)
    await prisma.document.delete({
      where: { id: documentId }
    })

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}