import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { createTemplateVersion } from '@/lib/email/template-service';

// GET /api/admin/email-templates/[id] - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        history: {
          orderBy: { version: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error('Error fetching email template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email template' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/email-templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      category,
      subject,
      preheader,
      html,
      plainText,
      variables,
      metadata,
      isActive,
      changeDescription,
    } = body;

    // Check if template exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create version history before updating
    await createTemplateVersion(params.id, session.user.id, changeDescription);

    // Update template
    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        slug: slug !== undefined ? slug : existing.slug,
        category: category !== undefined ? category : existing.category,
        subject: subject !== undefined ? subject : existing.subject,
        preheader: preheader !== undefined ? preheader : existing.preheader,
        html: html !== undefined ? html : existing.html,
        plainText: plainText !== undefined ? plainText : existing.plainText,
        variables: variables !== undefined ? variables : existing.variables,
        metadata: metadata !== undefined ? metadata : existing.metadata,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/email-templates/[id] - Deactivate template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete - just deactivate
    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: 'Template deactivated successfully', template },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    );
  }
}
