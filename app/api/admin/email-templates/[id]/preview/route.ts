import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { renderTemplate } from '@/lib/email/template-service';

// POST /api/admin/email-templates/[id]/preview - Render template with sample data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { variables } = body;

    if (!variables) {
      return NextResponse.json(
        { error: 'Variables are required for preview' },
        { status: 400 }
      );
    }

    // Render template
    const rendered = await renderTemplate({
      templateId: params.id,
      variables,
    });

    return NextResponse.json(
      {
        html: rendered.html,
        plainText: rendered.plainText,
        subject: rendered.subject,
        preheader: rendered.preheader,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error previewing email template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to preview template';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
