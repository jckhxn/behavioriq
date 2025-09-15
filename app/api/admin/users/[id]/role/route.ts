import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { Role } from '@prisma/client'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role)
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id
    const body = await request.json()
    
    const validation = updateRoleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { role } = validation.data

    // Prevent self-demotion
    if (userId === session.user.id && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change your own admin role' },
        { status: 400 }
      )
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      message: 'User role updated successfully',
      user
    })
  } catch (error) {
    console.error('Update user role error:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}