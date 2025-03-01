import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, summary, sources } = await req.json()

    if (!title || !summary || !sources) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const savedResult = await prisma.savedResult.create({
      data: {
        title,
        summary,
        sources,
        userId: session.user.id,
      },
    })

    return NextResponse.json(savedResult)
  } catch (error) {
    console.error('Save result error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const savedResults = await prisma.savedResult.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(savedResults)
  } catch (error) {
    console.error('Get saved results error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Result ID is required' },
        { status: 400 }
      )
    }

    // Verify the result belongs to the user
    const result = await prisma.savedResult.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!result) {
      return NextResponse.json(
        { message: 'Result not found' },
        { status: 404 }
      )
    }

    await prisma.savedResult.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'Result deleted successfully' })
  } catch (error) {
    console.error('Delete saved result error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 