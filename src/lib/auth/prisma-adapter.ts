import { PrismaClient } from '@prisma/client'
import { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters'

export function PrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    createUser: async (data: Omit<AdapterUser, "id">) => {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          emailVerified: data.emailVerified,
          name: data.name || null,
          image: data.image || null,
        },
      })
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || undefined,
        image: user.image || undefined,
      }
    },
    getUser: async (id: string) => {
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || undefined,
        image: user.image || undefined,
      }
    },
    getUserByEmail: async (email: string) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || undefined,
        image: user.image || undefined,
      }
    },
    getUserByAccount: async (
      provider: Pick<AdapterAccount, "provider" | "providerAccountId">
    ) => {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: provider.provider,
            providerAccountId: provider.providerAccountId,
          },
        },
        include: { user: true },
      })
      if (!account) return null
      const { user } = account
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || undefined,
        image: user.image || undefined,
      }
    },
    updateUser: async (data: Partial<AdapterUser> & { id: string }) => {
      const user = await prisma.user.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      })
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || undefined,
        image: user.image || undefined,
      }
    },
    deleteUser: async (userId: string) => {
      await prisma.user.delete({ where: { id: userId } })
    },
    linkAccount: async (data: AdapterAccount) => {
      await prisma.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
        },
      })
    },
    unlinkAccount: async (
      provider: Pick<AdapterAccount, "provider" | "providerAccountId">
    ) => {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider: provider.provider,
            providerAccountId: provider.providerAccountId,
          },
        },
      })
    },
    createSession: async (data: { sessionToken: string; userId: string; expires: Date }) => {
      const session = await prisma.session.create({
        data: {
          userId: data.userId,
          expires: data.expires,
          sessionToken: data.sessionToken,
        },
      })
      return {
        userId: session.userId,
        expires: session.expires,
        sessionToken: session.sessionToken,
      }
    },
    getSessionAndUser: async (sessionToken: string) => {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!session) return null
      const { user } = session
      return {
        session: {
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        },
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          name: user.name || undefined,
          image: user.image || undefined,
        },
      }
    },
    updateSession: async (data: Partial<AdapterSession> & { sessionToken: string }) => {
      const session = await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data: {
          expires: data.expires,
        },
      })
      return {
        userId: session.userId,
        expires: session.expires,
        sessionToken: session.sessionToken,
      }
    },
    deleteSession: async (sessionToken: string) => {
      await prisma.session.delete({ where: { sessionToken } })
    },
  }
} 