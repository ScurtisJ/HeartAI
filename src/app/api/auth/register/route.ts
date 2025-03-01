import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import nodemailer from 'nodemailer'
import { config } from '@/lib/config'

export async function POST(req: Request) {
  try {
    const { email, password, username, firstName, lastName } = await req.json()

    // Validate input
    if (!email || !password || !username || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verifyToken = Math.random().toString(36).substring(2, 15)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        verifyToken
      }
    })

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password
      }
    })

    await transporter.sendMail({
      from: config.email.smtp.user,
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to Heart!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${config.appUrl}/auth/verify-email?token=${verifyToken}">
          Verify Email
        </a>
        <p>This verification code will expire in 24 hours.</p>
      `
    })

    return NextResponse.json({ 
      message: 'User created successfully. Please check your email to verify your account.' 
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 