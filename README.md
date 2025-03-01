# Heart - Get to the Heart of Information

Heart is a web application designed to combat misinformation in the health and wellness industry by providing evidence-based information from reliable sources like the National Library of Medicine.

## Features

- Search for supplements, treatments, and health products
- Image recognition for product analysis
- Scientific study summaries and visualizations
- User accounts with email verification
- Saved searches and results
- Evidence-based information from reliable sources

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js
- Chart.js
- Tesseract.js (OCR)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your values

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `NEXTAUTH_URL`: Your application URL
- `SMTP_*`: Email service configuration
- `PUBMED_API_KEY`: API key for PubMed access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
