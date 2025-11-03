import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { restoreTemplateVersion } from '@/lib/email/template-service';

// POST /api/admin/email-templates/[id]/versions/[versionId]/restore - Restore version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versionNumber = parseInt(params.versionId);

    if (isNaN(versionNumber)) {
      return NextResponse.json(
        { error: 'Invalid version number' },
        { status: 400 }
      );
    }

    await restoreTemplateVersion(params.id, versionNumber, session.user.id);

    return NextResponse.json(
      { message: `Template restored to version ${versionNumber}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error restoring template version:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to restore version';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
