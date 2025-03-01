import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { config } from '@/lib/config'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, username, firstName, lastName } = await req.json()

    // Validate input
    if (!email || !password || !username || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verifyToken = crypto.randomBytes(3).toString('hex')

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
        verifyToken,
      },
    })

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password,
      },
    })

    await transporter.sendMail({
      from: config.email.smtp.user,
      to: email,
      subject: 'Verify your Heart account',
      html: `
        <h1>Welcome to Heart!</h1>
        <p>Your verification code is: <strong>${verifyToken}</strong></p>
        <p>Please enter this code to verify your account.</p>
        <p>This code will expire in 24 hours.</p>
      `,
    })

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 