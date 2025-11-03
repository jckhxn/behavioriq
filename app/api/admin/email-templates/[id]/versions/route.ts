import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// GET /api/admin/email-templates/[id]/versions - Get version history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [versions, total] = await Promise.all([
      prisma.emailTemplateVersion.findMany({
        where: { templateId: params.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { version: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.emailTemplateVersion.count({
        where: { templateId: params.id },
      }),
    ]);

    return NextResponse.json(
      {
        versions,
        total,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching template versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template versions' },
      { status: 500 }
    );
  }
}
