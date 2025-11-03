import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { renderTemplate } from '@/lib/email/template-service';
import { SESEmailService } from '@/lib/email/ses-email-service';

// POST /api/admin/email-templates/[id]/test - Send test email
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
    const { variables, recipientEmail } = body;

    if (!variables || !recipientEmail) {
      return NextResponse.json(
        { error: 'Variables and recipient email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Render template
    const rendered = await renderTemplate({
      templateId: params.id,
      variables,
    });

    // Send test email
    const result = await SESEmailService.sendEmail({
      to: recipientEmail,
      subject: `[TEST] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.plainText,
      userId: session.user.id,
      emailType: 'GENERIC',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Test email sent successfully',
        messageId: result.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending test email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send test email';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
