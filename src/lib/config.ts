export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com',
  api: {
    pubmed: {
      baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
      apiKey: process.env.PUBMED_API_KEY,
    },
  },
  auth: {
    nextAuth: {
      url: process.env.NEXTAUTH_URL || 'https://your-domain.com',
      secret: process.env.NEXTAUTH_SECRET,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },
} 